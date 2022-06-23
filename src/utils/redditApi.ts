import { Post, Story } from '@prisma/client';
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
            (await fetch(`https://www.reddit.com${subreddit}/${'top'}.json?limit=${options.count ?? 100}&raw_json=1`)).json()
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
    let stories: Story[] = [];
    data[1].data.children.forEach((val) => {
        if (val.data.author !== "AutoModerator" && data[1].data.children.length > 2) {
            stories.push(extractCommentDetails(val.data, postId));
        }
    })
    // console.log(stories)
    return stories;
}

const extractCommentDetails = (commentInfo: CommentDetails, postId: string) => {
    const { author, created_utc, id, permalink, score, title, body, body_html } = commentInfo;

    return { author, created: new Date(created_utc * 1000), id, permalink, score, title, body, postId, bodyHtml: body_html } as Story;
}