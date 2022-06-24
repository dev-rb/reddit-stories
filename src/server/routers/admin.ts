import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma, Post, Story, Reply } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchCommentsForPost, fetchSubredditPosts } from "../../utils/redditApi";

export const adminRouter = createRouter()
    .query("refetch", {
        async resolve() {
            // console.log("Admin Router Called Test");
            // console.log("Inital Posts: ", posts.length)
            let prompts: Post[] = await fetchSubredditPosts('/r/writingprompts', { fetchAll: true });

            for (const post of prompts) {
                await prisma.post.upsert({
                    create: { ...post },
                    update: { ...post },
                    where: {
                        id: post.id
                    }
                });
                // console.log("For Loop")
                // console.log("Stories Data: ", storiesData)
                let commentsAndReplies: (Story & { replies: Reply[] })[] = await fetchCommentsForPost('/r/writingprompts', post.id);
                for (const story of commentsAndReplies) {
                    const { replies, ...storyDetails } = story;
                    await prisma.story.upsert({
                        create: { ...storyDetails },
                        update: { ...storyDetails },
                        where: {
                            id: storyDetails.id
                        }
                    })
                    for (const reply of replies) {
                        await prisma.reply.upsert({
                            create: { ...reply },
                            update: { ...reply },
                            where: {
                                id: reply.id
                            }
                        })
                    }

                }


            }
            return "Done"
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