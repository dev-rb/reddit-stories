import { Post, Comment } from '@prisma/client';
import { CommentDetails, IPost, PostDetails, PostInfo, Posts, RedditComment, RedditCommentRoot, RedditSortType } from '../interfaces/reddit';
import { ExtendedReply, IStory, NormalizedReplies, Prompt, StoryAndReplies } from '../interfaces/db';
import { Stream } from 'stream';

interface RedditFetchOptions {
    sortType?: string,
    timeSort?: string | null,
    fetchAll?: boolean,
    count?: number
}

const promptTags = ['wp', 'cw', 'eu', 'pm', 'pi', 'sp', 'tt', 'rf'];


// Testing json streams
export const fetchSubredditPostsStream = async (subreddit: string) => {
    await (fetch(`https://www.reddit.com${subreddit}/hot.json?limit=100&raw_json=1`))
        .then((res) => res.body)
        .then((rb) => {
            let reader = rb?.getReader();

            return new ReadableStream({
                start(controller) {
                    function push() {
                        reader?.read().then(({ done, value }) => {
                            if (done) {
                                console.log(`DONE! ${done}`)
                                controller.close()
                                return;
                            }
                            console.log(`Value: ${value}`)
                            // const jsonData: Posts = JSON.parse(new TextDecoder("utf-8").decode(value));
                            // jsonData.data.children.forEach((val) => {
                            //     console.log(`Json data we can access: ${val}`)
                            // })
                            // console.log(`Done? ${done}...Value: ${JSON.parse(JSON.stringify(new TextDecoder("utf-8").decode(value)))}`)
                            controller.enqueue(value);

                            push();
                        })
                    }
                    push();

                }
            })
        }).then((stream) => {
            console.log(`Stream values: ${stream}`)

            return new Response(stream, { headers: { "Content-Type": "application/json" } }).json()
        }).then((result) => {
            console.log(`Result: ${JSON.stringify(result)}`)
        })
}

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
        const singleData: Posts = await (await fetch(`https://www.reddit.com${subreddit}/${options.sortType?.toString()}.json?${options.timeSort ? 't=' + options.timeSort + '&' : ''}limit=${options.count ?? 100}&raw_json=1`)).json();
        data = removeUnwantedPosts(removeDuplicates(singleData.data.children));
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
    const { author, created_utc, id, permalink, score, title, num_comments } = postInfo.data;

    return { author, created: new Date(created_utc * 1000), id, permalink, score, title, totalComments: num_comments } as Prompt;
}

export const getTotalCommentsForPost = async (subreddit: string, postId: string) => {
    let data: RedditCommentRoot[] = await (await fetch(`https://www.reddit.com${subreddit}/comments/${postId}.json?raw_json=1`)).json()
    return data[1].data.children.length - (+data[1].data.children.some((val) => val.data.author === 'AutoModerator'));
    //- (+data[1].data.children.some((val) => val.data.author === 'AutoModerator'));
}

export const fetchCommentsForPost = async (subreddit: string, postId: string) => {

    let data: RedditCommentRoot[] = await (await fetch(`https://www.reddit.com${subreddit}/comments/${postId}.json?raw_json=1`)).json()
    // console.log(data)
    let stories: (IStory & { replies: IStory[] })[] = [];
    const commentDetails = data[1].data.children;
    const commentDetailsLength = commentDetails.length;

    for (let i = 0; i < commentDetailsLength; i++) {
        let val = commentDetails[i];
        if (val.data.author !== "AutoModerator") {
            stories.push(extractCommentDetails(val.data, postId));
        }
    }
    // const replies = getRepliesForComment(commentInfo, commentInfo.author, commentInfo.id, null, []);
    // console.log(replies);
    // console.log(stories)
    return stories;
}

const extractCommentDetails = (commentInfo: CommentDetails, postId: string) => {
    const { author, created_utc, id, permalink, score, title, body, body_html } = commentInfo;
    const story: StoryAndReplies = {
        author,
        created: new Date(created_utc * 1000),
        id,
        permalink,
        score,
        body,
        postId,
        bodyHtml: body_html,
        updatedAt: undefined!,
        replies: getRepliesForComment(postId, commentInfo, commentInfo.author, commentInfo.id, null, []) ?? [],
        mainCommentId: null,
        replyId: null
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
const getRepliesForComment = (postId: string, commentInfo: CommentDetails, commentAuthor: string, parentCommentId: string, parentReplyId: string | null, replies: IStory[]) => {

    // console.log(commentInfo.replies, commentInfo.replies.data, commentInfo.replies.data.children)
    // If there are no replies, return and continue looking through the rest of the replies
    if (commentInfo.replies === undefined || commentInfo.replies.data === undefined || commentInfo.replies.data.children.length === 0) {
        return
    }
    // console.log(commentInfo);
    // Loop through all the replies for this comment
    const commentDetails = commentInfo.replies.data.children;
    const commentDetailsLength = commentDetails.length;

    // console.log(commentDetails)

    for (let i = 0; i < commentDetailsLength; i++) {
        const val = commentDetails[i];
        const { author, body, body_html, created_utc, id, replies: repliesForReply, permalink, score } = val.data;
        if (body_html === undefined || id === '_') {
            // console.log("Found undefined at: ", val.data,)
            return
        }
        // Uncomment to only get this reply if it's from the author of the story
        // if (author === commentAuthor) {
        const reply: IStory = {
            author,
            body,
            bodyHtml: body_html,
            created: new Date(created_utc * 1000),
            id,
            score,
            updatedAt: undefined!,
            mainCommentId: parentCommentId,
            replyId: parentReplyId,
            permalink,
            postId: postId
        };
        // Add this reply to the list of accumulated relies
        replies.push(reply);
        // Recursively call this function again on the current reply we are on to check for if it has replies as well. 
        // We go through all nested replies
        getRepliesForComment(postId, val.data, commentAuthor, parentCommentId, id, replies);
        // }
    }

    return replies;
}

const recursiveFind = (start: ExtendedReply, findId: string, lookingForOriginId: string): ExtendedReply | undefined => {
    if (start.id === findId) {
        return start;
    } else {
        for (let i = 0; i < start.replies.length; i++) {
            let val = start.replies[i];
            const found: ExtendedReply | undefined = recursiveFind(val, findId, lookingForOriginId);;
            if (found !== undefined) {
                return found
            }
        }
    }
    return;
}

export const normalizedReplies = (replies: Comment[]) => {
    let normalizedReplies: NormalizedReplies = {};

    replies.forEach((reply, index) => {
        normalizedReplies[reply.id] = { ...reply, replies: [...replies.filter((val) => val.replyId === reply.id).map((val) => val.id)] };
    })

    return normalizedReplies;
}

export const getReplies = (replies: Comment[]) => {
    let nestedReplies: ExtendedReply[] = [];
    replies.forEach((reply) => {
        if (reply.replyId === null) {
            const newReply: ExtendedReply = { ...reply, replies: [] }
            nestedReplies.push(newReply);
        } else if (reply.replyId !== null) {
            const newReply: ExtendedReply = { ...reply, replies: [] }
            nestedReplies.forEach((val) => {
                let foundDeep = recursiveFind(val, newReply.replyId!, newReply.id);
                if (foundDeep) {
                    foundDeep.replies.push(newReply);
                }
            })
        }
    });

    return nestedReplies;
}