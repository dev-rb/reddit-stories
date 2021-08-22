import { Posts, CommentDetails, PostInfo, IPost } from "../interfaces/reddit";
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

//       /r/WritingPrompts/comments/p86yum/wp_youve_just_defeated_the_dark_lord_as_you_were/
export const storiesForPostWithId = (postId: string) => {
    fetchFromUrl(`/r/WritingPrompts/comments/${postId}`).then((comment: PostInfo[]) => {
        console.warn(comment)
    })
}