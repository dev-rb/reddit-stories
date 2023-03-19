import { CommentDetails, PostInfo, Posts, RedditCommentRoot } from '../types/reddit';
import { Comments, IStory, Prompt } from '../types/db';

interface RedditFetchOptions {
  sortType?: string;
  timeSort?: string | null;
  fetchAll?: boolean;
  count?: number;
}

const promptTags = ['wp', 'cw', 'eu', 'pm', 'pi', 'sp', 'tt', 'rf'];

type SubredditName<T extends string> = T extends `r/${infer Name}` ? Name : T extends `/r/${infer Name}` ? Name : T;

export const fetchSubredditPosts = async <T extends string>(
  subreddit: SubredditName<T>,
  options: RedditFetchOptions
) => {
  let data: PostInfo[] = [];
  const count = options.count ?? 100;
  if (options.fetchAll) {
    const [newData, hotData, topData] = await Promise.all([
      (await fetch(`https://www.reddit.com/r/${subreddit}/${'new'}.json?limit=${count}&raw_json=1`)).json(),
      (await fetch(`https://www.reddit.com/r/${subreddit}/${'hot'}.json?limit=${count}&raw_json=1`)).json(),
      (await fetch(`https://www.reddit.com/r/${subreddit}/${'top'}.json?limit=${count}&raw_json=1&t=day`)).json(),
    ]);

    const allData = [...newData.data.children, ...hotData.data.children, ...topData.data.children];
    data = removeUnwantedPosts(removeDuplicates(allData));
  } else {
    const timeSort = options.timeSort ? `t=${options.timeSort}` : '';
    const singleData: Posts = await (
      await fetch(
        `https://www.reddit.com/r/${subreddit}/${options.sortType?.toString()}.json?${
          timeSort + '&'
        }limit=${count}&raw_json=1`
      )
    ).json();
    data = removeUnwantedPosts(singleData.data.children);
  }

  return data.map(extractPostDetails);
};

export const fetchPostById = async <T extends string>(subreddit: SubredditName<T>, id: string): Promise<Prompt> => {
  const singleData: Posts[] = await (
    await fetch(`https://www.reddit.com/r/${subreddit}/comments/${id}.json?&raw_json=1`)
  ).json();

  return extractPostDetails(singleData[0].data.children[0]);
};

const removeUnwantedPosts = (arr: PostInfo[]) => {
  return arr.filter((val) => promptTags.includes(val.data.permalink.split('/')[5].substring(0, 2)));
};

const removeDuplicates = (arr: PostInfo[]) => {
  return [...new Set(arr)];
};

const extractPostDetails = (postInfo: PostInfo): Prompt => {
  const { author, created_utc, id, permalink, score, title, num_comments } = postInfo.data;

  return {
    author,
    created: new Date(created_utc * 1000),
    id,
    permalink,
    score,
    title,
    totalComments: num_comments,
    updatedAt: null,
  };
};

export const fetchCommentsForPost = async (subreddit: string, postId: string) => {
  let data: RedditCommentRoot[] = await (
    await fetch(`https://www.reddit.com${subreddit}/comments/${postId}.json?raw_json=1`)
  ).json();
  const commentDetails = data[1].data.children;

  const filteredComments = commentDetails.filter(
    (comment) => comment.data.author !== 'AutoModerator' && (comment.kind === 't1' || comment.kind === 'Listing')
  );

  let map: Comments = {};

  for (const comment of filteredComments) {
    extractCommentDetails(comment.data, null, null, postId, map);
  }

  return map;
};

const extractCommentDetails = (
  commentInfo: CommentDetails,
  grandparentId: string | null,
  parentId: string | null,
  postId: string,
  map: Comments
) => {
  const { author, created_utc, id, permalink, score, title, body, body_html, replies } = commentInfo;

  const story: IStory & { replies: string[] } = {
    author,
    created: new Date(created_utc * 1000),
    id,
    permalink,
    score,
    body,
    postId,
    bodyHtml: body_html,
    updatedAt: null,
    replies: [],
    mainCommentId: grandparentId,
    replyId: parentId,
    repliesTotal: 0,
  };

  map[id] = story;

  if (parentId) {
    const currentValue = map[parentId];
    if (currentValue) {
      map[parentId] = {
        ...currentValue,
        replies: [...currentValue.replies, id],
        repliesTotal: currentValue.repliesTotal + 1,
      };
    }
  }

  if (replies === undefined || replies.data === undefined || replies.data.children.length === 0) {
    return;
  }

  if (!parentId && !grandparentId) {
    grandparentId = id;
  }

  const filteredReplies = replies.data.children.filter(
    (v) => v.data.author !== 'AutoModerator' && (v.kind === 't1' || v.kind === 'Listing')
  );

  for (const reply of filteredReplies) {
    extractCommentDetails(reply.data, grandparentId, id, postId, map);
  }

  return map;
};
