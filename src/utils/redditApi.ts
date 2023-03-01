import { Comment } from '@prisma/client';
import { CommentDetails, PostInfo, Posts, RedditCommentRoot } from '../types/reddit';
import { IStory, NormalizedReplies, Prompt, StoryAndNormalizedReplies } from '../types/db';

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

const removeUnwantedPosts = (arr: PostInfo[]) => {
  return arr.filter((val) => promptTags.includes(val.data.permalink.split('/')[5].substring(0, 2)));
};

const removeDuplicates = (arr: PostInfo[]) => {
  return [...new Set(arr)];
};

const extractPostDetails = (postInfo: PostInfo) => {
  const { author, created_utc, id, permalink, score, title, num_comments } = postInfo.data;

  return {
    author,
    created: new Date(created_utc * 1000),
    id,
    permalink,
    score,
    title,
    totalComments: num_comments,
  } as Prompt;
};

export const fetchCommentsForPost = async (subreddit: string, postId: string) => {
  let data: RedditCommentRoot[] = await (
    await fetch(`https://www.reddit.com${subreddit}/comments/${postId}.json?raw_json=1`)
  ).json();
  const commentDetails = data[1].data.children;

  return commentDetails
    .filter(
      (comment) => comment.data.author !== 'AutoModerator' && (comment.kind === 't1' || comment.kind === 'Listing')
    )
    .map((v) => extractCommentDetails(v.data, postId));
};

const extractCommentDetails = (commentInfo: CommentDetails, postId: string) => {
  const { author, created_utc, id, permalink, score, title, body, body_html } = commentInfo;
  const replies = normalizeReplies(
    { comment: commentInfo, grandparentId: id, parentAuthor: author, parentId: null, postId },
    {}
  );
  // console.log(commentInfo.replies?.data?.children);
  const story: StoryAndNormalizedReplies = {
    author,
    created: new Date(created_utc * 1000),
    id,
    permalink,
    score,
    body,
    postId,
    bodyHtml: body_html,
    updatedAt: null,
    replies: replies ?? {},
    mainCommentId: null,
    replyId: null,
    repliesTotal: replies ? Object.keys(replies).length : 0,
  };
  return story;
};

interface NormalizeRepliesArgs {
  postId: string;
  comment: CommentDetails;
  parentAuthor: string;
  grandparentId: string;
  parentId: string | null;
}

const normalizeReplies = (
  { parentAuthor, comment, grandparentId, parentId, postId }: NormalizeRepliesArgs,
  map: NormalizedReplies
) => {
  const replies = comment.replies;

  if (replies === undefined || replies.data === undefined || replies.data.children.length === 0) {
    return;
  }

  for (const reply of replies.data.children) {
    const { author, body, body_html, created_utc, id, permalink, score } = reply.data;

    if (reply.data.author !== 'AutoModerator' && reply.kind !== 't1' && reply.kind !== 'Listing') continue;

    const comment: IStory & { replies: string[] } = {
      author,
      body,
      bodyHtml: body_html,
      created: new Date(created_utc * 1000),
      id,
      score,
      updatedAt: null,
      mainCommentId: grandparentId,
      replyId: parentId,
      permalink,
      postId: postId,
      replies: [],
      repliesTotal: 0,
    };

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

    map[id] = comment;

    normalizeReplies({ parentAuthor, comment: reply.data, grandparentId, parentId: id, postId }, map);
  }

  return map;
};
