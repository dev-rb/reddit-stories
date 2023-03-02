import { createRouter } from '.';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { fetchCommentsForPost, fetchPostById } from 'src/utils/redditApi';
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
      const comments = await fetchCommentsForPost('/r/writingprompts', id);
      const count = await ctx.prisma.post.count({ where: { id: id! } });

      if (count === 0) {
        const { totalComments, updatedAt, ...post } = await fetchPostById('writingprompts', id);
        await ctx.prisma.post.create({ data: { ...post } });
      }

      ctx.prisma.$transaction(
        Object.values(comments).map((comment) => {
          const { postId, replies, liked, favorited, readLater, updatedAt, id, ...rest } = comment;
          return ctx.prisma.comment.upsert({
            create: {
              id: id,
              ...rest,
              Post: {
                connect: {
                  id: postId!,
                },
              },
            },
            update: {
              ...rest,
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
        })
      );

      for (let comment of Object.values(comments)) {
        if (userId) {
          const userStory = await ctx.prisma.userCommentSaved.findUnique({
            where: {
              userId_commentId: {
                commentId: comment.id,
                userId,
              },
            },
          });
          if (userStory) {
            comment.liked = userStory.liked;
            comment.readLater = userStory.readLater;
            comment.favorited = userStory.favorited;
          }
        }
      }

      if (!comments) {
        throw new TRPCError({
          cause: undefined,
          code: 'NOT_FOUND',
          message: `No story with id '${id}'`,
        });
      }
      return comments;
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
