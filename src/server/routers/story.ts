import { createRouter } from '.';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { fetchCommentsForPost } from 'src/utils/redditApi';
import { PostStatus } from './post';

const defaultStorySelect = Prisma.validator<Prisma.CommentSelect>()({
  id: true,
  score: true,
  author: true,
  permalink: true,
  body: true,
  bodyHtml: true,
  created: true,
  userCommentSaved: true,
});
const postStatusTypeSchema = z.enum(['liked', 'favorited', 'readLater']);
const POST_STATUSES = ['liked', 'favorited', 'readLater'] as const;

export const storiesRouter = createRouter()
  .query('forPost', {
    input: z.object({
      id: z.string(),
      userId: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      const { id, userId } = input;
      const stories = await fetchCommentsForPost('/r/writingprompts', id);

      for (let story of stories) {
        const { author, body, bodyHtml, created, id, permalink, score, postId, replies } = story;
        const count = await ctx.prisma.post.count({ where: { id: postId! } });

        if (count === 0) continue;

        await ctx.prisma.comment.upsert({
          create: {
            author,
            body,
            bodyHtml,
            created,
            id,
            permalink,
            score,
            Post: {
              connect: {
                id: postId!,
              },
            },
          },
          update: {
            author,
            body,
            bodyHtml,
            created,
            id,
            permalink,
            score,
            Post: {
              connect: {
                id: postId!,
              },
            },
          },
          where: {
            id,
          },
        });

        if (userId) {
          await Promise.all(
            Object.keys(replies).map(async (replyId) => {
              const userCommentSaved = await ctx.prisma.userCommentSaved.findUnique({
                where: {
                  userId_commentId: {
                    commentId: replyId,
                    userId,
                  },
                },
              });
              if (userCommentSaved) {
                console.log('Found info for reply');
                replies[replyId].liked = userCommentSaved.liked;
                replies[replyId].readLater = userCommentSaved.readLater;
                replies[replyId].favorited = userCommentSaved.favorited;
              }

              //prettier-ignore
              const { author, body, bodyHtml, created, id, permalink, mainCommentId, score, postId, updatedAt } = replies[replyId];

              await ctx.prisma.comment.upsert({
                create: {
                  author,
                  body,
                  bodyHtml,
                  id,
                  created,
                  permalink,
                  score,
                  mainCommentId,
                  postId,
                  updatedAt,
                },
                update: {
                  author,
                  body,
                  bodyHtml,
                  id,
                  created,
                  permalink,
                  score,
                  mainCommentId,
                  postId,
                  updatedAt,
                },
                where: {
                  id,
                },
              });

              return replyId;
            })
          );

          const userStory = await ctx.prisma.userCommentSaved.findUnique({
            where: {
              userId_commentId: {
                commentId: story.id,
                userId,
              },
            },
          });
          if (userStory) {
            story.liked = userStory.liked;
            story.readLater = userStory.readLater;
            story.favorited = userStory.favorited;
          }
        }
      }

      if (!stories) {
        throw new TRPCError({
          cause: undefined,
          code: 'NOT_FOUND',
          message: `No story with id '${id}'`,
        });
      }
      return stories;
    },
  })
  // .query("byId", {
  //     input: z.object({
  //         id: z.string()
  //     }),
  //     async resolve({ input, ctx }) {
  //         const { id } = input;

  //         const story = await ctx.prisma.comment.findUnique({
  //             where: {
  //                 id: id
  //             },
  //             select: {
  //                 ...defaultStorySelect,
  //                 mainCommentId: true,
  //                 replyId: true
  //             },
  //         });

  //         const storyWithReplies: StoryAndReplies =

  //         if (!story) {
  //             throw new TRPCError({
  //                 cause: undefined,
  //                 code: 'NOT_FOUND',
  //                 message: `No story with id '${id}'`,
  //             });
  //         }
  //         return story;
  //     }
  // })
  .mutation('updateCommentStatus', {
    input: z.object({
      userId: z.string(),
      commentId: z.string(),
      status: postStatusTypeSchema,
      newValue: z.boolean(),
    }),
    async resolve({ input, ctx }) {
      const { commentId, status, newValue, userId } = input;
      const others: PostStatus[] = POST_STATUSES.filter((val) => val !== status) as PostStatus[];
      let othersObj = {
        [status]: newValue,
        userId,
        [others[0]]: false,
        [others[1]]: false,
      };

      const comment = await ctx.prisma.comment.update({
        where: { id: commentId },
        data: {
          userCommentSaved: {
            upsert: {
              create: {
                [status]: newValue,
                ...(othersObj as any),
              },
              update: {
                [status]: newValue,
              },
              where: {
                userId_commentId: {
                  commentId,
                  userId,
                },
              },
            },
          },
        },
        select: defaultStorySelect,
      });

      return comment;
    },
  });
