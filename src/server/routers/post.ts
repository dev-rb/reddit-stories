import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Post, Prisma, Reply, Story } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { fetchSubredditPosts } from "src/utils/redditApi";

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
            sortType: z.string()
        }).nullish(),
        async resolve({ input }) {
            console.log("Sort called: ", input);
            if (input && input?.sortType === 'hot' || input?.sortType === 'new' || input?.sortType.includes('top')) {
                let prompts: Post[] = await fetchSubredditPosts('/r/writingprompts', { sortType: input.sortType });
                return prompts;

            } else {
                throw new TRPCError({
                    code: 'BAD_REQUEST',
                    message: `"${input?.sortType}" sort type not supported`
                })
            }
            return [];
        }
    })
    .query('hot', {
        async resolve() {
            // const hotAlgo = '(((SIGN(score)) * LOG10(GREATEST(1, ABS(score)))) + ((UNIX_TIMESTAMP(created) - 1134028003)/45000))'
            // const result = await prisma.$queryRaw<Post[]>`SELECT p.*, (((SIGN(p.score)) * LOG10(GREATEST(1, ABS(p.score)))) + ((UNIX_TIMESTAMP(p.created) - 1134028003)/45000)) AS hotness FROM Post p ORDER BY hotness DESC JOIN Story st ON p.id = st.postId`
            // const test = await prisma.$queryRaw`SELECT * FROM Post LEFT JOIN Story ON (Post.id=Story.postId) GROUP BY Post.id, Story.id`
            const posts = await prisma.post.findMany({
                include: {
                    stories: {
                        include: {
                            replies: true
                        }
                    }
                }
            });

            const result = posts.map((post) => {
                return {
                    ...post,
                    hotness: (Math.sign(post.score) * Math.log10(Math.max(1, Math.abs(post.score))) + (((post.created.getTime() / 1000) - 1134028003) / 45000))
                }
            }).sort((a, b) => b.hotness - a.hotness);

            return result;
        }
    })
    .query('top', {
        async resolve() {
            return await prisma.post.findMany({
                orderBy: {
                    score: 'desc'
                },
                include: {
                    stories: {
                        include: {
                            replies: true
                        }
                    }
                }
            })

        }
    })
    .query('new', {
        async resolve() {
            return await prisma.post.findMany({
                orderBy: {
                    created: 'desc'
                },
                include: {
                    stories: {
                        include: {
                            replies: true
                        }
                    }
                }
            })

        }
    })
    .query("all", {
        async resolve() {
            return await prisma.post.findMany({
                select: defaultPostSelect,
            })
        }
    })
    .query("byId", {
        input: z.object({
            id: z.string()
        }),
        async resolve({ input }) {
            const { id } = input;

            const post = await prisma.post.findUnique({
                where: {
                    id: id
                },
                select: defaultPostSelect
            });

            if (!post) {
                throw new TRPCError({
                    cause: undefined,
                    code: 'NOT_FOUND',
                    message: `No post with id '${id}'`,
                });
            }
            return post;
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