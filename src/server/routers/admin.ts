import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchFromUrl } from "../../helpers/fetchData";
import { getAllPrompts } from "../../helpers/cleanData";
import { IPost } from "../../interfaces/reddit";

export const adminRouter = createRouter()
    .query("refetch", {
        async resolve() {
            const data = getAllPrompts(await fetchFromUrl('/r/writingprompts/hot'), 'hot')
            prisma.post.createMany({
                data,
                skipDuplicates: true
            })

            for (const post of data) {
                prisma.story.createMany({
                    data: [...post.stories],
                    skipDuplicates: true
                })

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