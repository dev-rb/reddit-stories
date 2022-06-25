import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Post, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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
    .query('hot', {
        async resolve() {
            const hotAlgo = '(((SIGN(score)) * LOG10(GREATEST(1, ABS(score)))) + ((UNIX_TIMESTAMP(created) - 1134028003)/45000))'
            const result = await prisma.$queryRaw<Post[]>`SELECT *, (((SIGN(score)) * LOG10(GREATEST(1, ABS(score)))) + ((UNIX_TIMESTAMP(created) - 1134028003)/45000)) AS hotness FROM Post ORDER BY hotness DESC`

            // console.log(result);
            return result;
        }
    })
    .query('top', {
        async resolve() {


        }
    })
    .query('new', {
        async resolve() {


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