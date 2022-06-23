import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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
            return await prisma.story.findMany({
                where: {
                    postId: postId
                },
                select: defaultStorySelect,
            })
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
                select: defaultStorySelect
            });

            if (!story) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: `No story with id '${id}'`,
                });
            }
            return story;
        }
    })
    .mutation("like", {
        input: z.object({
            userId: z.string().uuid(),
            storyId: z.string(),
            liked: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { storyId, liked, userId } = input;
            const story = prisma.story.update({
                where: { id: storyId },
                data: {
                    userStorySaved: {
                        update: {
                            where: {
                                userId_storyId: {
                                    storyId,
                                    userId
                                }
                            },
                            data: {
                                liked: liked
                            }
                        }
                    }
                },
                select: defaultStorySelect
            });

            return story;
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