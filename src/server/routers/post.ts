import { createRouter } from '.';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { fetchPostById, fetchSubredditPosts } from 'src/utils/redditApi';
import { Prompt } from 'src/types/db';
import { addPosts, getPosts } from 'src/utils/redis';
import { Context } from '../context';

const postStatusTypeSchema = z.enum(['liked', 'favorited', 'readLater']);
export type PostStatus = z.TypeOf<typeof postStatusTypeSchema>;

const POST_STATUSES = ['liked', 'favorited', 'readLater'];

const postExists = async (ctx: Context, postId: string) => {
  return (await ctx.prisma.post.count({ where: { id: postId } })) !== 0;
};

export const postRouter = createRouter()
  .query('sort', {
    input: z.object({
      sortType: z.enum(['hot', 'top', 'new']),
      timeSort: z.enum(['day', 'week', 'month', 'year', 'all']).nullish(),
      userId: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      if (input.sortType !== 'hot' && input.sortType !== 'new' && input.sortType !== 'top') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `"${input?.sortType}" sort type not supported`,
        });
      }

      const posts = await getPosts(input.sortType, input.timeSort);

      let prompts: Prompt[] = [];
      if (posts !== undefined && posts !== null && (input.sortType === 'hot' || input.sortType === 'top')) {
        prompts = posts as unknown as Prompt[];
      } else {
        console.log('Fetch new');
        prompts = await fetchSubredditPosts('writingprompts', {
          sortType: input.sortType,
          timeSort: input.timeSort,
        });

        for (const prompt of prompts) {
          const { totalComments, liked, readLater, favorited, userRead, updatedAt, ...rest } = prompt;
          ctx.prisma.post.upsert({
            create: { ...rest },
            update: { ...rest },
            where: {
              id: prompt.id,
            },
          });
        }

        await addPosts(prompts, input.sortType, input.timeSort);
      }

      // If there is no userId, we can return what we have
      if (input.userId === undefined) return prompts;

      // Otherwise, check if user has interacted with this post
      return await Promise.all(
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

      let prompt: Prompt;
      const exists = await postExists(ctx, id);

      if (!exists) {
        const { totalComments, updatedAt, ...post } = await fetchPostById('writingprompts', id);
        await ctx.prisma.post.create({ data: { ...post } });
        prompt = { ...post, totalComments, updatedAt };
      } else {
        const post = await ctx.prisma.post.findUniqueOrThrow({
          include: { comments: true },
          where: {
            id: id,
          },
        });
        prompt = { ...post, totalComments: post.comments.length };
      }

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

      if (!prompt) {
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

      const exists = await postExists(ctx, postId);

      if (!exists) {
        const { totalComments, updatedAt, ...post } = await fetchPostById('writingprompts', postId);
        await ctx.prisma.post.create({ data: { ...post } });
      }

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
        include: {
          comments: true,
          userPostSaved: true,
        },
      });
      return post;
    },
  });
