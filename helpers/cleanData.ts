import { Posts, CommentDetails, PostInfo } from "../interfaces/reddit";
import { IPost } from "../pages";
import { fetchFromUrl } from "./fetchData";

export const getAllPrompts = (data: Posts) => {
    let posts = data.data.children;

    let prompts: IPost[] = [];
    posts.forEach((post) => {
        if (post.data.permalink.split('/')[5].includes('wp') && post.data.num_comments > 1) {
            let { title, id, score, author, permalink, created } = post.data;

            let stories: CommentDetails[] = [];
            fetchFromUrl(permalink).then((commentPosts: Posts[]) => {
                let comments: PostInfo[] = commentPosts[1].data.children;
                comments.shift();

                // console.log(comments)
                comments.forEach((comment) => {
                    if (comment.data.author === "AutoModerator" && comments.length <= 2) {
                        console.log(comment.data.body)
                    }
                    let { title, body, author, ups, score, id, permalink, body_html, created } = comment.data;
                    let newComment: CommentDetails = { body: body, author: author, body_html: body_html, id: id, permalink: permalink, score: score, title: title, ups: ups, created: created }
                    stories.push(newComment);
                });
            });
            prompts.push({ title, id, score, author, permalink: permalink, stories: stories, created: created })
        }
    });

    prompts = prompts.filter((prompt) => prompt.stories.length < 1)
    // console.log(prompts)
    prompts = prompts.sort((a, b) => b.score - a.score);
    return prompts;
}

export const getAllCommentsForPost = (postId: string) => {

}