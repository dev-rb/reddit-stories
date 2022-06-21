import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchFromUrl } from "/@/helpers/fetchData";
import { getAllPrompts } from "/@/helpers/cleanData";
import { IPost } from "/@/interfaces/reddit";

export const adminRouter = createRouter()
    .query("refetch", {
        async resolve() {
            const data = getAllPrompts(await fetchFromUrl('/r/writingprompts/hot'), 'hot')

            for (const post of data) {
                const exists = await prisma.post.findMany({
                    where: {
                        id: post.id
                    },
                    take: 1
                }).then(r => r.length > 0)

                if (exists) continue
                else {
                    await prisma.post.create({
                        data: {
                            author: post.author,
                            created: "0",
                            id: post.id,
                            permalink: post.permalink,
                            score: post.score,
                            title: post.title,
                        }
                    })
                }
            }
        }
    })
    .mutation("delete-post", {
        input: z.object({
            id: z.string()
        }),
        async resolve({ input }) {
            const { id } = input;

            prisma.post.delete({
                where: {
                    id
                }
            });
        }
    })
    .mutation("delete-story", {
        input: z.object({
            id: z.string()
        }),
        async resolve({ input }) {
            const { id } = input;

            prisma.story.delete({
                where: {
                    id
                }
            })
        }
    })