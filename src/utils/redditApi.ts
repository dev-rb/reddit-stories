import { Post, Story, Reply } from '@prisma/client';
import { CommentDetails, IPost, PostDetails, PostInfo, Posts, RedditComment, RedditCommentRoot, RedditSortType } from '../interfaces/reddit';

interface RedditFetchOptions {
    sortType?: RedditSortType,
    fetchAll?: boolean,
    count?: number
}

const promptTags = ['wp', 'cw', 'eu', 'pm', 'pi', 'sp', 'tt', 'rf'];

export const fetchSubredditPosts = async (subreddit: string, options: RedditFetchOptions) => {
    let data: PostInfo[] = []
    if (options.fetchAll) {
        const [newData, hotData, topData] = await Promise.all([
            (await fetch(`https://www.reddit.com${subreddit}/${'new'}.json?limit=${options.count ?? 100}&raw_json=1`)).json(),
            (await fetch(`https://www.reddit.com${subreddit}/${'hot'}.json?limit=${options.count ?? 100}&raw_json=1`)).json(),
            (await fetch(`https://www.reddit.com${subreddit}/${'top'}.json?limit=${options.count ?? 100}&raw_json=1&t=day`)).json()
        ]);

        const allData = [...newData.data.children, ...hotData.data.children, ...topData.data.children];
        // console.log(newData, hotData, topData)
        data = removeUnwantedPosts(removeDuplicates(allData));
    } else {
        data = await (await fetch(`https://www.reddit.com${subreddit}/${options.sortType?.toString()}.json?limit=${options.count ?? 100}&raw_json=1`)).json()
    }

    return data.map((val) => extractPostDetails(val));
}

const removeUnwantedPosts = (arr: PostInfo[]) => {
    return arr.filter((val) => promptTags.includes(val.data.permalink.split('/')[5].substring(0, 2)))
}

const removeDuplicates = (arr: PostInfo[]) => {
    return [...new Set(arr)]
}

// const example: IPost = {
//     author: '',
//     created: '',
//     id: '',
//     permalink: '',
//     score: 0,
//     stories: [],
//     title: ''
// }

const extractPostDetails = (postInfo: PostInfo) => {
    const { author, created_utc, id, permalink, score, title } = postInfo.data;

    return { author, created: new Date(created_utc * 1000), id, permalink, score, title } as Post;
}

export const fetchCommentsForPost = async (subreddit: string, postId: string) => {
    let data: RedditCommentRoot[] = await (await fetch(`https://www.reddit.com${subreddit}/comments/${postId}.json?raw_json=1`)).json()
    // console.log(data)
    let stories: (Story & { replies: Reply[] })[] = [];
    data[1].data.children.forEach((val) => {
        if (val.data.author !== "AutoModerator") {
            stories.push(extractCommentDetails(val.data, postId));
        }
    })
    // const replies = getRepliesForComment(commentInfo, commentInfo.author, commentInfo.id, null, []);
    // console.log(replies);
    // console.log(stories)
    return stories;
}

const extractCommentDetails = (commentInfo: CommentDetails, postId: string) => {
    const { author, created_utc, id, permalink, score, title, body, body_html } = commentInfo;
    const story: Story & { replies: Reply[] } = {
        author,
        created: new Date(created_utc * 1000),
        id,
        permalink,
        score,
        body,
        postId,
        bodyHtml: body_html,
        updatedAt: undefined!,
        replies: getRepliesForComment(commentInfo, commentInfo.author, commentInfo.id, null, []) ?? []
    };
    return story;
}

/**
 * 
 * @param commentInfo      the info for the comment/reply
 * @param commentAuthor    the author of the original comment/story so we can process replies that are only from the author to capture different parts of the story
 * @param parentCommentId  id for the main comment/story that these replies are a part of
 * @param parentReplyId    if a reply is nested, we want to keep track of what reply it is nested inside of so we take its parents id
 * @param replies          array for accumulated nested replies
 * @returns                accumulated replies after we've gone through all of them
 */
const getRepliesForComment = (commentInfo: CommentDetails, commentAuthor: string, parentCommentId: string, parentReplyId: string | null, replies: Reply[]) => {

    // If there are no replies, return and continue looking through the rest of the replies
    if (commentInfo.replies === undefined || commentInfo.replies.data === undefined || commentInfo.replies.data.children.length === 0) {
        return
    }
    // console.log(commentInfo);
    // Loop through all the replies for this comment
    commentInfo.replies.data.children.forEach((val) => {
        const { author, body, body_html, created_utc, id, replies: repliesForReply, permalink, score, title } = val.data;

        // Uncomment to only get this reply if it's from the author of the story
        // if (author === commentAuthor) {
        const reply: Reply = {
            author, body, bodyHtml: body_html, created: new Date(created_utc * 1000), id, score,
            updatedAt: undefined!,
            storyId: parentCommentId,
            replyId: parentReplyId
        };
        // Add this reply to the list of accumulated relies
        replies.push(reply);
        // Recursively call this function again on the current reply we are on to check for if it has replies as well. 
        // We go through all nested replies
        getRepliesForComment(val.data, commentAuthor, parentCommentId, id, replies);
        // }
    })

    return replies;
}