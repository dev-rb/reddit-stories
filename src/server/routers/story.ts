import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma, Story } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchCommentsForPost, getReplies } from "src/utils/redditApi";
import { ExtendedReply, IStory } from "src/interfaces/db";

const defaultStorySelect = Prisma.validator<Prisma.StorySelect>()({
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
            const result = await prisma.story.findMany({
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
                let newStory: Story & { replies: ExtendedReply[] } = { ...story, replies: [...getReplies(replies)] }
                return newStory;
            })
            return newResult;
        }
    })
    .query("forPosts", {
        input: z.array(z.object({
            id: z.string()
        })),
        async resolve({ input }) {

            const inputLength = input.length;

            let allResults: (Story & {
                replies: ExtendedReply[];
            })[] = []

            for (let i = 0; i < inputLength; i++) {
                const stories = await fetchCommentsForPost('/r/writingprompts', input[i].id);
                const newResult = stories.map((val) => {
                    let { replies, ...story } = val;
                    let newStory: Story & { replies: ExtendedReply[] } = { ...story, replies: [...getReplies(replies)] }
                    return newStory;
                });

                allResults.concat(newResult);
            }


            // const story = await prisma.story.findUnique({
            //     where: {
            //         id: id
            //     },
            //     select: {
            //         ...defaultStorySelect,
            //         replies: true
            //     },
            // });

            if (!allResults) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'NOT_FOUND',
                    message: `No stories found'`,
                });
            }
            return allResults;
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
            let newResult = stories.map((val) => {
                let { replies, ...story } = val;
                let newStory: IStory & { replies: ExtendedReply[] } = { ...story, replies: [...getReplies(replies)] }
                return newStory;
            })

            if (userId) {
                for (const story of newResult) {
                    const userStory = await prisma.userStorySaved.findUnique({
                        where: {
                            userId_storyId: {
                                storyId: story.id,
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
            // const story = await prisma.story.findUnique({
            //     where: {
            //         id: id
            //     },
            //     select: {
            //         ...defaultStorySelect,
            //         replies: true
            //     },
            // });

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

            const story = await prisma.story.findUnique({
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
    .mutation("like", {
        input: z.object({
            userId: z.string(),
            storyId: z.string(),
            liked: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { storyId, liked, userId } = input;
            const userStory = await prisma.userStorySaved.upsert({
                create: {
                    liked,
                    favorited: false,
                    readLater: false,
                    storyId,
                    userId
                },
                update: {
                    liked,
                    userId,
                },
                where: {
                    userId_storyId: {
                        storyId,
                        userId
                    }
                }
            })

            return userStory;
        }
    })
    .mutation("favorite", {
        input: z.object({
            userId: z.string().uuid(),
            storyId: z.string(),
            favorited: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { storyId, favorited, userId } = input;
            const story = prisma.story.update({
                where: { id: storyId },
                data: {
                    userStorySaved: {
                        update: {
                            where: {
                                userId_storyId: {
                                    userId,
                                    storyId
                                }
                            },
                            data: {
                                favorited: favorited
                            }
                        }
                    }
                },
                select: defaultStorySelect
            });

            return story;
        }
    })
    .mutation("readLater", {
        input: z.object({
            userId: z.string().uuid(),
            storyId: z.string(),
            readLater: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { storyId, readLater, userId } = input;
            const story = prisma.story.update({
                where: { id: storyId },
                data: {
                    userStorySaved: {
                        update: {
                            where: {
                                userId_storyId: {
                                    userId,
                                    storyId
                                }
                            },
                            data: {
                                readLater: readLater
                            }
                        }
                    }
                },
                select: defaultStorySelect
            });

            return story;
        }
    })