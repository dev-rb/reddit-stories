import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Post, Prisma, Reply, Story } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { fetchCommentsForPost, fetchSubredditPosts, getReplies, getTotalCommentsForPost } from "src/utils/redditApi";
import { Prompt, PromptAndStoriesWithReplies, PromptAndStories, PromptAndStoriesWithExtendedReplies, StoryAndExtendedReplies } from "src/interfaces/db";
import { addPosts, getPosts } from "src/utils/redis";

const defaultPostSelect = Prisma.validator<Prisma.PostSelect>()({
    id: true,
    title: true,
    score: true,
    author: true,
    created: true,
    permalink: true,
    stories: true,
    userPostSaved: true
});

export const postRouter = createRouter()
    .mutation('create', {
        input: z.object({
            id: z.string(),
            title: z.string(),
            author: z.string(),

        }),
        async resolve({ input }) {
            const { author, id, title } = input;
            console.log("Mutate called")
            return prisma.post.create({
                data: {
                    author,
                    id,
                    title,
                    created: new Date(Date.now()),
                    permalink: 'https://google.com',
                    score: 120
                }
            })
        }
    })
    .query('sort', {
        input: z.object({
            sortType: z.enum(['hot', 'top', 'new']),
            timeSort: z.enum(['day', 'week', 'month', 'year', 'all']).nullish(),
            userId: z.string().optional()
        }),
        async resolve({ input }) {
            console.log("Sort called in backend: ", input);
            if (input.sortType === 'hot' || input.sortType === 'new' || input.sortType.includes('top')) {
                // const posts = await getPosts(input.sortType, input.timeSort);
                // if (posts !== undefined && posts !== null) {
                //     console.log("Posts from redis: ")
                //     return posts as unknown as Prompt[];
                // }
                let prompts: Prompt[] = await fetchSubredditPosts('/r/writingprompts', { sortType: input.sortType, timeSort: input.timeSort })

                await prisma.post.createMany({
                    data: [...prompts.map((val) => {
                        const { totalComments, liked, readLater, saved, ...rest } = val;
                        return { ...rest }
                    })],
                    skipDuplicates: true
                })
                // Check if user has saved or liked any of the posts

                if (input.userId !== undefined) {
                    prompts = await Promise.all(prompts.map(async (prompt) => {
                        const dbPost = await prisma.userPostSaved.findFirst({
                            where: {
                                userId: input.userId!,
                                postId: prompt.id
                            }
                        });

                        return { ...prompt, liked: dbPost?.liked, readLater: dbPost?.readLater, saved: dbPost?.favorited };
                    }))
                }

                // await addPosts(prompts, input.sortType, input.timeSort)

                return prompts;
            } else {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `"${input?.sortType}" sort type not supported`
                })
            }
        }
    })
    .query("byId", {
        input: z.object({
            id: z.string(),
            userId: z.string().optional()
        }),
        async resolve({ input }) {
            const { id, userId } = input;

            console.log("backend called")

            const post = await prisma.post.findUnique({
                where: {
                    id: id
                },
                rejectOnNotFound: true,
            });

            let prompt: Prompt = { ...post, totalComments: await getTotalCommentsForPost('/r/writingprompts', post.id) }

            if (userId) {
                const userPrompt = await prisma.userPostSaved.findUnique({
                    where: {
                        userId_postId: {
                            userId,
                            postId: id
                        }
                    }
                });

                if (userPrompt) {
                    prompt.liked = userPrompt.liked;
                    prompt.readLater = userPrompt.readLater;
                    prompt.saved = userPrompt.favorited;
                }
            }


            if (!post) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'NOT_FOUND',
                    message: `No post with id '${id}'`,
                });
            }


            return prompt;
        }
    })
    .mutation("like", {
        input: z.object({
            userId: z.string(),
            postId: z.string(),
            liked: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { postId, liked, userId } = input;
            const post = prisma.post.update({
                where: { id: postId },
                data: {
                    userPostSaved: {
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
                                userId_postId: {
                                    postId,
                                    userId
                                }
                            }
                        }
                    }
                },
                select: defaultPostSelect
            });

            return post;
        }
    })
    .mutation("favorite", {
        input: z.object({
            userId: z.string().uuid(),
            postId: z.string(),
            favorited: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { postId, favorited, userId } = input;
            const post = prisma.post.update({
                where: { id: postId },
                data: {
                    userPostSaved: {
                        update: {
                            where: {
                                userId_postId: {
                                    userId,
                                    postId
                                }
                            },
                            data: {
                                favorited: favorited
                            }
                        }
                    }
                },
                select: defaultPostSelect
            });

            return post;
        }
    })
    .mutation("readLater", {
        input: z.object({
            userId: z.string().uuid(),
            postId: z.string(),
            readLater: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { postId, readLater, userId } = input;
            const post = prisma.post.update({
                where: { id: postId },
                data: {
                    userPostSaved: {
                        update: {
                            where: {
                                userId_postId: {
                                    userId,
                                    postId
                                }
                            },
                            data: {
                                readLater: readLater
                            }
                        }
                    }
                },
                select: defaultPostSelect
            });

            return post;
        }
    })
