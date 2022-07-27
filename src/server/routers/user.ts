import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { TRPCError } from "@trpc/server";
import { IStory, Prompt } from "src/interfaces/db";
import { getTotalCommentsForPost } from "src/utils/redditApi";

export const userRouter = createRouter()
    .query("getLikes", {
        input: z.object({
            userId: z.string().optional(),
            status: z.enum(['liked', 'favorited', 'readLater'])
        }),
        async resolve({ input }) {
            const { userId, status } = input;

            if (!userId) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated'
                })
            }

            const userLikes = await prisma.user.findFirst({
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
                                include: {
                                    replies: {
                                        include: {
                                            _count: true
                                        }
                                    }
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
                    ({ ...val.post, liked: val.liked, readLater: val.readLater, saved: val.favorited, totalComments: await getTotalCommentsForPost('/r/writingprompts', val.postId) })),
                ...userLikes.savedComments.map(async (val) =>
                    ({ ...val.comment, liked: val.liked, readLater: val.readLater, saved: val.favorited, totalComments: val.comment.replies.length })),
                ]
            );
            console.log("All likes: ", posts);
            return posts;
        }
    })