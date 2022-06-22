import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma, Post, Story } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchFromUrl } from "../../helpers/fetchData";
import { getAllPrompts, fetchStoriesForPostWithId } from "../../helpers/cleanData";
import { IPost, PostInfo, Posts } from "../../interfaces/reddit";
import { fetchCommentsForPost, fetchSubredditPosts } from "../../utils/redditApi";

const promptTags = ['wp', 'cw', 'eu', 'pm', 'pi', 'sp', 'tt', 'rf'];

export const adminRouter = createRouter()
    .query("refetch", {
        async resolve() {
            // console.log("Admin Router Called Test");
            // console.log("Inital Posts: ", posts.length)
            let prompts: Post[] = await fetchSubredditPosts('/r/writingprompts', { fetchAll: true });

            // console.log("After Processing Posts: ", prompts.length)
            // console.log("Adding Prompts to DB")
            await prisma.post.createMany({
                data: [...prompts],
                skipDuplicates: true
            }).then(() => { console.log("Completed") })

            // console.log("Start adding stories")

            for (const post of prompts) {
                // console.log("For Loop")
                // console.log("Stories Data: ", storiesData)
                let stories: Story[] = await fetchCommentsForPost('/r/writingprompts', post.id);
                await prisma.story.createMany({
                    data: [...stories],
                    skipDuplicates: true
                })

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