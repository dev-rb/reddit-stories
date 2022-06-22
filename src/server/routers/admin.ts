import { createRouter } from ".";
import { prisma } from "../prisma";
import { z } from 'zod';
import { Prisma, Post, Story } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { fetchFromUrl } from "../../helpers/fetchData";
import { getAllPrompts, fetchStoriesForPostWithId } from "../../helpers/cleanData";
import { IPost, PostInfo, Posts } from "../../interfaces/reddit";

export const adminRouter = createRouter()
    .query("refetch", {
        async resolve() {
            console.log("Admin Router Called Test");
            const data: Posts = await (await fetchFromUrl(`/r/writingprompts/hot`))
            let posts = data.data.children;
            // console.log("Get All prompts called", posts)
            let prompts: Post[] = [];
            posts.forEach((post) => {
                if (post.data.permalink.split('/')[5].includes('wp') && post.data.num_comments > 1) {
                    let { title, id, score, author, permalink, created } = post.data;
                    // let hoursAgo = Math.abs(new Date().getHours() - new Date(created * 1000).getHours());
                    // let daysAgo = Math.abs(new Date().getDay() - new Date(created * 1000).getDay());
                    // let minutesAgo = Math.abs(new Date().getMinutes() - new Date(created * 1000).getMinutes());
                    prompts.push({ title, id, score, author, permalink: permalink, created: new Date(created * 1000) })
                }
            });
            console.log("Adding Prompts to DB")
            await prisma.post.createMany({
                data: [...prompts],
                skipDuplicates: true
            }).then(() => { console.log("Completed") })

            console.log("Start adding stories")
            for (const post of prompts) {
                // console.log("For Loop")
                const storiesData: Posts[] = await fetchStoriesForPostWithId(post.id);
                // console.log("Stories Data: ", storiesData)
                let stories: Story[] = [];
                if (storiesData.length > 1) {
                    let comments: PostInfo[] = [...storiesData[1].data.children];
                    comments.shift();
                    // console.log(comments)
                    comments.forEach((comment) => {
                        if (comment.data.author === "AutoModerator" && comments.length <= 2) {
                            console.log(comment.data.body)
                        }
                        let { title, body, author, ups, score, id, permalink, body_html, created } = comment.data;
                        let newComment: Story = {
                            body: body, author: author, bodyHtml: body_html, id: id, permalink: permalink, score: score, created: new Date(created * 1000),
                            postId: post.id
                        }
                        if (newComment.body !== undefined) {
                            stories.push(newComment);
                        }
                    });
                }

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