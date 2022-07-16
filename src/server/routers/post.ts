import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Post, Prisma, Reply, Story } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { fetchCommentsForPost, fetchSubredditPosts, getReplies, getTotalCommentsForPost } from "src/utils/redditApi";
import { Prompt, PromptAndStoriesWithReplies, PromptAndStories, PromptAndStoriesWithExtendedReplies, StoryAndExtendedReplies } from "src/interfaces/db";

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
    // .query('sort', {
    //     input: z.object({
    //         sortType: z.enum(['hot', 'top', 'new']),
    //         timeSort: z.enum(['day', 'week', 'month', 'year', 'all']).nullish()
    //     }).nullish(),
    //     async resolve({ input }) {
    //         console.log("Sort called: ", input);
    //         if (input && input?.sortType === 'hot' || input?.sortType === 'new' || input?.sortType.includes('top')) {
    //             let prompts: Prompt[] = await fetchSubredditPosts('/r/writingprompts', { sortType: input.sortType, timeSort: input.timeSort });
    //             let totalComments = []
    //             await prisma.post.createMany({
    //                 data: [...prompts.map(({ totalStories, ...rest }) => rest)],
    //                 skipDuplicates: true
    //             })

    //             const totalPromptsLength = prompts.length;
    //             for (let i = 0; i < totalPromptsLength; i++) {
    //                 totalComments.push(getTotalCommentsForPost('/r/writingprompts', prompts[i].id));
    //             }

    //             await Promise.all(totalComments).then((totals) => {
    //                 for (let i = 0; i < prompts.length; i++) {
    //                     prompts[i] = { ...prompts[i], totalStories: totals[i] }

    //                 }
    //             });

    //             return prompts;


    //             // console.log(postsAndStories)
    //         } else {
    //             throw new TRPCError({
    //                 code: 'BAD_REQUEST',
    //                 message: `"${input?.sortType}" sort type not supported`
    //             })
    //         }


    //     }
    // })
    .query('sort', {
        input: z.object({
            sortType: z.enum(['hot', 'top', 'new']),
            timeSort: z.enum(['day', 'week', 'month', 'year', 'all']).nullish()
        }).nullish(),
        async resolve({ input }) {
            console.log("Sort called in backend: ", input);
            if (input && input?.sortType === 'hot' || input?.sortType === 'new' || input?.sortType.includes('top')) {
                let prompts: Prompt[] = await fetchSubredditPosts('/r/writingprompts', { sortType: input.sortType, timeSort: input.timeSort })

                await prisma.post.createMany({
                    data: [...prompts.map((val) => {
                        const { totalComments, ...rest } = val;
                        return rest
                    })],
                    skipDuplicates: true
                })

                // const totalPromptsLength = prompts.length;
                // for (let i = 0; i < totalPromptsLength; i++) {
                //     totalComments.push(fetchCommentsForPost('/r/writingprompts', prompts[i].id));
                // }

                // let newPrompts: PromptAndStoriesWithExtendedReplies[] = []
                // await Promise.all(totalComments).then((allStories) => {
                //     for (let i = 0; i < prompts.length; i++) {
                //         let storiesForPrompt = allStories[i];
                //         let newStories: StoryAndExtendedReplies[] = [];
                //         newStories = storiesForPrompt.map((val) => {
                //             return { ...val, replies: getReplies(val.replies) }
                //         })
                //         let newPost: PromptAndStoriesWithExtendedReplies = { ...prompts[i], stories: newStories }
                //         newPrompts.push(newPost)

                //     }
                // });

                return prompts;


                // console.log(postsAndStories)
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
            id: z.string()
        }),
        async resolve({ input }) {
            const { id } = input;

            console.log("backend called")

            const post = await prisma.post.findUnique({
                where: {
                    id: id
                },
                rejectOnNotFound: true,
            });

            if (!post) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'NOT_FOUND',
                    message: `No post with id '${id}'`,
                });
            }

            const prompt: Prompt = { ...post, totalComments: await getTotalCommentsForPost('/r/writingprompts', post.id) }

            return prompt;
        }
    })
    .mutation("like", {
        input: z.object({
            userId: z.string().uuid(),
            postId: z.string(),
            liked: z.boolean()
        }),
        async resolve({ input, ctx }) {
            const { postId, liked, userId } = input;
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
                                liked: liked
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