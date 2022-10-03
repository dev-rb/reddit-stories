import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { TRPCError } from "@trpc/server";
import { IStory, Prompt } from "src/types/db";
import { getTotalCommentsForPost } from "src/utils/redditApi";
import { Prisma } from "@prisma/client";

const defaultStorySelect = Prisma.validator<Prisma.CommentSelect>()({
    id: true,
    score: true,
    author: true,
    permalink: true,
    body: true,
    bodyHtml: true,
    created: true,
});

export const userRouter = createRouter()
    .query("getLikes", {
        input: z.object({
            userId: z.string().optional(),
            status: z.enum(['liked', 'favorited', 'readLater'])
        }),
        async resolve({ input, ctx }) {
            const { userId, status } = input;

            if (!userId) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated'
                })
            }

            const userLikes = await ctx.prisma.user.findFirst({
                where: {
                    id: userId,

                },

                select: {
                    savedComments: {
                        where: {
                            [status]: {
                                equals: true
                            }
                        },
                        include: {
                            comment: {
                                select: {
                                    ...defaultStorySelect,
                                    mainCommentId: true,
                                    updatedAt: true,
                                    replyId: true,
                                    postId: true,
                                }
                            }
                        }
                    },
                    savedPosts: {
                        where: {
                            [status]: {
                                equals: true
                            }
                        },
                        include: {
                            post: true
                        }
                    }
                }
            });

            if (!userLikes) { console.log("NO data: ", userLikes); return; }

            const posts: (Prompt | IStory)[] = await Promise.all(
                [...userLikes.savedPosts.map(async (val) =>
                    ({ ...val.post, liked: val.liked, readLater: val.readLater, favorited: val.favorited, totalComments: await getTotalCommentsForPost('/r/writingprompts', val.postId) })),
                ...userLikes.savedComments.map(async (val) =>
                    ({ ...val.comment, liked: val.liked, readLater: val.readLater, favorited: val.favorited, totalComments: (await ctx.prisma.comment.findMany({ where: { mainCommentId: val.comment.id } })).length })),
                ]
            );
            return posts;
        }
    })