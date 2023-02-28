import { createRouter } from '.';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { fetchSubredditPosts, getTotalCommentsForPost } from 'src/utils/redditApi';
import { Prompt } from 'src/types/db';
import { addPosts, getPosts } from 'src/utils/redis';

const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
  id: true,
  title: true,
  score: true,
  author: true,
  created: true,
  permalink: true,
  comments: true,
  userPostSaved: true,
});

const postStatusTypeSchema = z.enum(['liked', 'favorited', 'readLater']);
export type PostStatus = z.TypeOf<typeof postStatusTypeSchema>;

const POST_STATUSES = ['liked', 'favorited', 'readLater'];

export const postRouter = createRouter()
  .query('sort', {
    input: z.object({
      sortType: z.enum(['hot', 'top', 'new']),
      timeSort: z.enum(['day', 'week', 'month', 'year', 'all']).nullish(),
      userId: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      console.log('Sort called in backend: ', input);
      if (input.sortType === 'hot' || input.sortType === 'new' || input.sortType.includes('top')) {
        const posts = await getPosts(input.sortType, input.timeSort);
        // console.log("Redis Data: ", posts);
        let prompts: Prompt[] = [];
        if (posts !== undefined && posts !== null && (input.sortType === 'hot' || input.sortType.includes('top'))) {
          prompts = posts as unknown as Prompt[];
        } else {
          prompts = await fetchSubredditPosts('/r/writingprompts', {
            sortType: input.sortType,
            timeSort: input.timeSort,
          });

          const createPosts = [
            ...prompts.map((prompt) => {
              const { totalComments, liked, readLater, favorited, userRead, ...rest } = prompt;
              return ctx.prisma.post.upsert({
                create: rest,
                update: rest,
                where: {
                  id: prompt.id,
                },
              });
            }),
          ];

          await Promise.all(createPosts);
          await addPosts(prompts, input.sortType, input.timeSort);
        }

        // Check if user has saved or liked any of the posts

        if (input.userId !== undefined) {
          prompts = await Promise.all(
            prompts.map(async (prompt) => {
              const dbPost = await ctx.prisma.userPostSaved.findFirst({
                where: {
                  userId: input.userId!,
                  postId: prompt.id,
                },
              });

              return { ...prompt, liked: dbPost?.liked, readLater: dbPost?.readLater, favorited: dbPost?.favorited };
            })
          );
        }

        return prompts;
      } else {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `"${input?.sortType}" sort type not supported`,
        });
      }
    },
  })
  .query('byId', {
    input: z.object({
      id: z.string(),
      userId: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      const { id, userId } = input;

      console.log('backend called');

      const post = await ctx.prisma.post.findUnique({
        where: {
          id: id,
        },
        rejectOnNotFound: true,
      });

      let prompt: Prompt = { ...post, totalComments: await getTotalCommentsForPost('/r/writingprompts', post.id) };

      if (userId) {
        const userPrompt = await ctx.prisma.userPostSaved.findUnique({
          where: {
            userId_postId: {
              userId,
              postId: id,
            },
          },
        });

        if (userPrompt) {
          prompt.liked = userPrompt.liked;
          prompt.readLater = userPrompt.readLater;
          prompt.favorited = userPrompt.favorited;
        }
      }

      if (!post) {
        throw new TRPCError({
          cause: undefined,
          code: 'NOT_FOUND',
          message: `No post with id '${id}'`,
        });
      }

      return prompt;
    },
  })
  .mutation('updatePostStatus', {
    input: z.object({
      userId: z.string(),
      postId: z.string(),
      status: postStatusTypeSchema,
      newValue: z.boolean(),
    }),
    async resolve({ input, ctx }) {
      const { postId, status, newValue, userId } = input;
      const others: PostStatus[] = POST_STATUSES.filter((val) => val !== status) as PostStatus[];
      let othersObj = {
        [status]: newValue,
        userId,
        [others[0]]: false,
        [others[1]]: false,
      };

      const post = await ctx.prisma.post.update({
        where: { id: postId },
        data: {
          userPostSaved: {
            upsert: {
              create: {
                [status]: newValue,
                ...(othersObj as any),
              },
              update: {
                [status]: newValue,
              },
              where: {
                userId_postId: {
                  postId,
                  userId,
                },
              },
            },
          },
        },
        select: defaultPostSelect,
      });
      return post;
    },
  });
