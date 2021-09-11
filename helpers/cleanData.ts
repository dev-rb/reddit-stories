import { Posts, CommentDetails, PostInfo, IPost } from "../interfaces/reddit";
import { fetchFromUrl } from "./fetchData";

export const getAllPrompts = (data: Posts, type?: string) => {
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
                        // console.log(comment.data.body)
                    }
                    let { title, body, author, ups, score, id, permalink, body_html, created } = comment.data;
                    let newComment: CommentDetails = { body: body, author: author, body_html: body_html, id: id, permalink: permalink, score: score, title: title, ups: ups, created: created }
                    stories.push(newComment);
                });
            });
            let hoursAgo = Math.abs(new Date().getHours() - new Date(created * 1000).getHours());
            let daysAgo = Math.abs(new Date().getDay() - new Date(created * 1000).getDay());
            let minutesAgo = Math.abs(new Date().getMinutes() - new Date(created * 1000).getMinutes());

            prompts.push({ title, id, score, author, permalink: permalink, stories: stories, created: { hoursAgo, minutesAgo, daysAgo } })

        }
    });
    prompts = type == "hot" ? prompts.sort((a, b) => b.score - a.score) : type == "rising" ? prompts.sort((a, b) => (b.score - a.score) || (a.created.hoursAgo - b.created.hoursAgo)) : prompts.sort((a, b) => a.created.hoursAgo - b.created.hoursAgo);
    return prompts;
    // prompts = prompts.filter((prompt) => prompt.stories.length < 1)
    // console.log(prompts)

}

//       /r/WritingPrompts/comments/p86yum/wp_youve_just_defeated_the_dark_lord_as_you_were/

export const fetchStoriesForPostWithId = (postId: string) => {
    const fetchedStories = fetchFromUrl(`/r/WritingPrompts/comments/${postId}/`);
    let formattedStories: CommentDetails[] = [];

    fetchedStories.then((data) => {
        formattedStories = formatStoriesData(data);
    })

    return formattedStories;
}

export const formatStoriesData = (data: Posts[]) => {
    let stories: CommentDetails[] = [];
    let comments: PostInfo[] = data[1].data.children;
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
    return stories;
}
