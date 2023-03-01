import { createRouter } from '.';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { IStory, Prompt } from 'src/types/db';

export const userRouter = createRouter().query('getLikes', {
  input: z.object({
    userId: z.string().optional(),
    status: z.enum(['liked', 'favorited', 'readLater']),
  }),
  async resolve({ input, ctx }) {
    const { userId, status } = input;

    if (!userId) {
      throw new TRPCError({
        cause: undefined,
        code: 'UNAUTHORIZED',
        message: 'User not authenticated',
      });
    }

    const userInteractions = await ctx.prisma.user.findFirst({
      where: {
        id: userId,
      },

      select: {
        savedComments: {
          where: {
            [status]: {
              equals: true,
            },
          },
          include: {
            comment: true,
          },
        },
        savedPosts: {
          where: {
            [status]: {
              equals: true,
            },
          },
          include: {
            post: {
              include: {
                comments: true,
              },
            },
          },
        },
      },
    });

    if (!userInteractions) {
      console.log('NO data: ', userInteractions);
      return;
    }
    const posts: (Prompt | IStory)[] = [
      ...userInteractions.savedPosts.map((val) => {
        const { comments, ...rest } = val.post;
        return {
          ...rest,
          liked: val.liked,
          readLater: val.readLater,
          favorited: val.favorited,
          totalComments: comments.length,
        };
      }),
      ...userInteractions.savedComments.map((val) => ({
        ...val.comment,
        liked: val.liked,
        readLater: val.readLater,
        favorited: val.favorited,
        totalComments: val.comment.repliesTotal,
      })),
    ];
    return posts;
  },
});
