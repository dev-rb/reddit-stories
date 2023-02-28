import { createRouter } from '.';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { fetchCommentsForPost, normalizedReplies } from 'src/utils/redditApi';
import { IStory, NormalizedReplies } from 'src/types/db';
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
const POST_STATUSES = ['liked', 'favorited', 'readLater'];

export const storiesRouter = createRouter()
  .query('forPost', {
    input: z.object({
      id: z.string(),
      userId: z.string().optional(),
    }),
    async resolve({ input, ctx }) {
      const { id, userId } = input;
      const stories = await fetchCommentsForPost('/r/writingprompts', id);
      for (const story of stories) {
        const { author, body, bodyHtml, created, id, permalink, score, postId, replies } = story;
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
          story.replies = await Promise.all(
            replies.map(async (reply) => {
              const userCommentSaved = await ctx.prisma.userCommentSaved.findUnique({
                where: {
                  userId_commentId: {
                    commentId: reply.id,
                    userId,
                  },
                },
              });
              if (userCommentSaved) {
                console.log('Found info for reply');
                reply.liked = userCommentSaved.liked;
                reply.readLater = userCommentSaved.readLater;
                reply.favorited = userCommentSaved.favorited;
              }

              const { author, body, bodyHtml, created, id, permalink, mainCommentId, score, postId, updatedAt } = reply;
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

              return reply;
            })
          );
        }
      }

      let newResult = stories.map((val) => {
        let { replies, ...story } = val;
        let newStory: IStory & { replies: NormalizedReplies } = { ...story, replies: normalizedReplies(replies) };
        return newStory;
      });

      // console.log("Normalized Replies: ", normalizedReplies(stories[0].replies))

      if (userId) {
        console.log('Find usercommentsaved');
        for (const story of newResult) {
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
      if (!newResult) {
        throw new TRPCError({
          cause: undefined,
          code: 'NOT_FOUND',
          message: `No story with id '${id}'`,
        });
      }
      return newResult;
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
