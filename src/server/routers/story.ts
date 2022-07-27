import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma, Comment } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchCommentsForPost, getReplies } from "src/utils/redditApi";
import { ExtendedReply, IStory } from "src/interfaces/db";

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
    .query("all", {
        input: z.object({
            postId: z.string()
        }),
        async resolve({ input }) {
            const { postId } = input;
            const result = await prisma.comment.findMany({
                where: {
                    postId: postId
                },
                select: {
                    ...defaultStorySelect,
                    replies: true,
                    updatedAt: true,
                    postId: true
                },

            });
            let newResult = result.map((val) => {
                let { replies, ...story } = val;
                let newStory: Comment & { replies: ExtendedReply[] } = { ...story, replies: [...getReplies(replies)], mainCommentId: null, replyId: null }
                return newStory;
            })
            return newResult;
        }
    })
    .query("forPost", {
        input: z.object({
            id: z.string(),
            userId: z.string().optional()
        }),
        async resolve({ input }) {
            // console.log("Story For Post called")
            const { id, userId } = input;
            const stories = await fetchCommentsForPost('/r/writingprompts', id);

            for (const story of stories) {
                const { liked, readLater, replies, saved, mainCommentId, ...restOfStory } = story;
                await prisma.comment.upsert({
                    create: {
                        author: restOfStory.author,
                        body: restOfStory.body,
                        bodyHtml: restOfStory.bodyHtml,
                        created: restOfStory.created,
                        id: restOfStory.id,
                        permalink: restOfStory.permalink,
                        score: restOfStory.score,
                        postId: restOfStory.postId,
                    },
                    update: {
                        author: restOfStory.author,
                        body: restOfStory.body,
                        bodyHtml: restOfStory.bodyHtml,
                        created: restOfStory.created,
                        id: restOfStory.id,
                        permalink: restOfStory.permalink,
                        score: restOfStory.score,
                        postId: restOfStory.postId,
                    },
                    where: {
                        id: restOfStory.id
                    }

                });

                if (userId) {
                    for (let reply of replies) {
                        const userCommentSaved = await prisma.userCommentSaved.findUnique({
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
                    }
                }

                await prisma.comment.createMany({
                    data: [...replies.map((val) => {
                        const { mainCommentId, replyId, liked, readLater, saved, ...rest } = val;
                        // console.log("Reply: ", rest)
                        return rest;
                    })],
                    skipDuplicates: true
                })
            }

            let newResult = stories.map((val) => {
                let { replies, ...story } = val;
                let newStory: IStory & { replies: ExtendedReply[] } = { ...story, replies: [...getReplies(replies)] }
                return newStory;
            })

            if (userId) {
                console.log("Find usercommentsaved")
                for (const story of newResult) {
                    const userStory = await prisma.userCommentSaved.findUnique({
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
    .query("byId", {
        input: z.object({
            id: z.string()
        }),
        async resolve({ input }) {
            const { id } = input;

            const story = await prisma.comment.findUnique({
                where: {
                    id: id
                },
                select: {
                    ...defaultStorySelect,
                    replies: true
                },
            });

            if (!story) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'NOT_FOUND',
                    message: `No story with id '${id}'`,
                });
            }
            return story;
        }
    })
    .query("getLikes", {
        input: z.object({
            userId: z.string().optional()
        }),
        async resolve({ input }) {
            const { userId } = input;

            if (!userId) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated'
                })
            }

            const userLikes = await prisma.userCommentSaved.findMany({
                where: {
                    userId,
                    liked: true
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
            });

            const comments: IStory[] = userLikes.map((val) => ({ ...val.comment, liked: val.liked, readLater: val.readLater, saved: val.favorited, totalComments: val.comment.replies.length }));
            return comments;
        }
    })
    .query("getSaves", {
        input: z.object({
            userId: z.string().optional()
        }),
        async resolve({ input }) {
            const { userId } = input;

            if (!userId) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated'
                })
            }

            const userLikes = await prisma.userCommentSaved.findMany({
                where: {
                    userId,
                    favorited: true
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
            });

            const comments: IStory[] = userLikes.map((val) => ({ ...val.comment, liked: val.liked, readLater: val.readLater, saved: val.favorited, totalComments: val.comment.replies.length }));
            return comments;
        }
    })
    .query("getReadLaters", {
        input: z.object({
            userId: z.string().optional()
        }),
        async resolve({ input }) {
            const { userId } = input;

            if (!userId) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'UNAUTHORIZED',
                    message: 'User not authenticated'
                })
            }

            const userLikes = await prisma.userCommentSaved.findMany({
                where: {
                    userId,
                    readLater: true
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
            });

            const comments: IStory[] = userLikes.map((val) => ({ ...val.comment, liked: val.liked, readLater: val.readLater, saved: val.favorited, totalComments: val.comment.replies.length }));
            return comments;
        }
    })
    .mutation("like", {
        input: z.object({
            userId: z.string(),
            commentId: z.string(),
            liked: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { commentId, liked, userId } = input;
            const comment = prisma.comment.update({
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
            userId: z.string().uuid(),
            commentId: z.string(),
            favorited: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { commentId, favorited, userId } = input;
            const comment = prisma.comment.update({
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
            userId: z.string().uuid(),
            commentId: z.string(),
            readLater: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { commentId, readLater, userId } = input;
            const comment = prisma.comment.update({
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