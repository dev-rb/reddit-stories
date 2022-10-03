import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma, Comment } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchCommentsForPost, getReplies, normalizedReplies } from "src/utils/redditApi";
import { ExtendedReply, IStory, NormalizedReplies, StoryAndReplies } from "src/types/db";
import { PostStatus } from "./post";

const defaultStorySelect = Prisma.validator<Prisma.CommentSelect>()({
    id: true,
    score: true,
    author: true,
    permalink: true,
    body: true,
    bodyHtml: true,
    created: true,
    userCommentSaved: true
});
const postStatusTypeSchema = z.enum(['liked', 'favorited', 'readLater']);
const POST_STATUSES = ['liked', 'favorited', 'readLater'];

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
                const { liked, readLater, replies, favorited, mainCommentId, ...restOfStory } = story;
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
                            reply.favorited = userCommentSaved.favorited;
                        }

                        return reply;
                    }))
                }

                await ctx.prisma.comment.createMany({
                    data: [...replies.map((val) => {
                        const { liked, readLater, favorited, ...rest } = val;
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
    .mutation("updateCommentStatus", {
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
                                ...othersObj as any,
                            },
                            update: {
                                [status]: newValue,
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