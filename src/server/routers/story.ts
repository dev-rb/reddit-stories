import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma, Comment } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchCommentsForPost, getReplies, normalizedReplies } from "src/utils/redditApi";
import { ExtendedReply, IStory, NormalizedReplies, StoryAndReplies } from "src/interfaces/db";

const defaultStorySelect = Prisma.validator<Prisma.CommentSelect>()({
    id: true,
    score: true,
    author: true,
    permalink: true,
    body: true,
    bodyHtml: true,
    created: true,
});

export const storiesRouter = createRouter()
    .query("forPost", {
        input: z.object({
            id: z.string(),
            userId: z.string().optional()
        }),
        async resolve({ input, ctx }) {
            // console.log("Story For Post called")
            const { id, userId } = input;
            const stories = await fetchCommentsForPost('/r/writingprompts', id);
            for (const story of stories) {
                const { liked, readLater, replies, saved, mainCommentId, ...restOfStory } = story;
                await ctx.prisma.comment.upsert({
                    create: {
                        author: restOfStory.author,
                        body: restOfStory.body,
                        bodyHtml: restOfStory.bodyHtml,
                        created: restOfStory.created,
                        id: restOfStory.id,
                        permalink: restOfStory.permalink,
                        score: restOfStory.score,
                        Post: {
                            connect: {
                                id: restOfStory.postId!
                            }
                        },
                    },
                    update: {
                        author: restOfStory.author,
                        body: restOfStory.body,
                        bodyHtml: restOfStory.bodyHtml,
                        created: restOfStory.created,
                        id: restOfStory.id,
                        permalink: restOfStory.permalink,
                        score: restOfStory.score,
                        Post: {
                            connect: {
                                id: restOfStory.postId!
                            }
                        },
                    },
                    where: {
                        id: restOfStory.id
                    }

                });

                if (userId) {
                    story.replies = await Promise.all(replies.map(async (reply) => {
                        const userCommentSaved = await ctx.prisma.userCommentSaved.findUnique({
                            where: {
                                userId_commentId: {
                                    commentId: reply.id,
                                    userId
                                }
                            }
                        });
                        if (userCommentSaved) {
                            console.log("Found info for reply")
                            reply.liked = userCommentSaved.liked;
                            reply.readLater = userCommentSaved.readLater;
                            reply.saved = userCommentSaved.favorited;
                        }

                        return reply;
                    }))
                }

                await ctx.prisma.comment.createMany({
                    data: [...replies.map((val) => {
                        const { liked, readLater, saved, ...rest } = val;
                        // console.log("Reply: ", rest)
                        return rest;
                    })],
                    skipDuplicates: true
                })
            }

            let newResult = stories.map((val) => {
                let { replies, ...story } = val;
                let newStory: IStory & { replies: NormalizedReplies } = { ...story, replies: normalizedReplies(replies) }
                return newStory;
            })

            // console.log("Normalized Replies: ", normalizedReplies(stories[0].replies))

            if (userId) {
                console.log("Find usercommentsaved")
                for (const story of newResult) {
                    const userStory = await ctx.prisma.userCommentSaved.findUnique({
                        where: {
                            userId_commentId: {
                                commentId: story.id,
                                userId
                            }
                        }
                    });
                    if (userStory) {
                        story.liked = userStory.liked;
                        story.readLater = userStory.readLater;
                        story.saved = userStory.favorited;
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
        }
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
    .mutation("like", {
        input: z.object({
            userId: z.string(),
            commentId: z.string(),
            liked: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { commentId, liked, userId } = input;
            const comment = ctx.prisma.comment.update({
                where: { id: commentId },
                data: {
                    userCommentSaved: {
                        upsert: {
                            create: {
                                userId,
                                liked,
                                favorited: false,
                                readLater: false
                            },
                            update: {
                                liked,
                                userId
                            },
                            where: {
                                userId_commentId: {
                                    commentId,
                                    userId
                                }
                            }
                        }
                    }
                },
                select: defaultStorySelect
            });

            return comment;
        }

    })
    .mutation("favorite", {
        input: z.object({
            userId: z.string(),
            commentId: z.string(),
            favorited: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { commentId, favorited, userId } = input;
            console.log("Story favorited called")
            const comment = ctx.prisma.comment.update({
                where: { id: commentId },
                data: {
                    userCommentSaved: {
                        upsert: {
                            create: {
                                favorited,
                                userId,
                                liked: false,
                                readLater: false,
                            },
                            update: {
                                favorited,
                                userId
                            },
                            where: {
                                userId_commentId: {
                                    userId,
                                    commentId
                                }
                            },
                        }
                    }
                },
                select: defaultStorySelect
            });

            return comment;
        }
    })
    .mutation("readLater", {
        input: z.object({
            userId: z.string(),
            commentId: z.string(),
            readLater: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { commentId, readLater, userId } = input;
            const comment = ctx.prisma.comment.update({
                where: { id: commentId },
                data: {
                    userCommentSaved: {
                        upsert: {
                            create: {
                                readLater,
                                userId,
                                liked: false,
                                favorited: false,
                            },
                            update: {
                                readLater,
                                userId
                            },
                            where: {
                                userId_commentId: {
                                    userId,
                                    commentId
                                }
                            },
                        }
                    }
                },
                select: defaultStorySelect
            });

            return comment;
        }
    })