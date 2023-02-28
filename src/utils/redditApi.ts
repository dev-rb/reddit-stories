import { Comment } from '@prisma/client';
import { CommentDetails, PostInfo, Posts, RedditCommentRoot } from '../types/reddit';
import { IStory, NormalizedReplies, Prompt, StoryAndNormalizedReplies, StoryAndReplies } from '../types/db';

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

export const getTotalCommentsForPost = async (subreddit: string, postId: string) => {
  let data: RedditCommentRoot[] = await (
    await fetch(`https://www.reddit.com${subreddit}/comments/${postId}.json?raw_json=1`)
  ).json();
  return data[1].data.children.length - +data[1].data.children.some((val) => val.data.author === 'AutoModerator');
};

export const fetchCommentsForPost = async (subreddit: string, postId: string) => {
  let data: RedditCommentRoot[] = await (
    await fetch(`https://www.reddit.com${subreddit}/comments/${postId}.json?raw_json=1`)
  ).json();
  const commentDetails = data[1].data.children;

  return commentDetails
    .filter((comment) => comment.data.author !== 'AutoModerator')
    .map((v) => extractCommentDetails(v.data, postId));
};

const extractCommentDetails = (commentInfo: CommentDetails, postId: string) => {
  const { author, created_utc, id, permalink, score, title, body, body_html } = commentInfo;
  const replies = normalizeReplies(
    { comment: commentInfo, grandparentId: id, parentAuthor: author, parentId: null, postId },
    {}
  );

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
    };

    if (parentId) {
      const currentValue = map[parentId];
      if (currentValue) {
        map[parentId] = { ...currentValue, replies: [...currentValue.replies, id] };
      }
    }

    map[id] = comment;

    normalizeReplies({ parentAuthor, comment: reply.data, grandparentId, parentId: id, postId }, map);
  }

  return map;
};

/**
 *
 * @param commentInfo      the info for the comment/reply
 * @param commentAuthor    the author of the original comment/story so we can process replies that are only from the author to capture different parts of the story
 * @param parentCommentId  id for the main comment/story that these replies are a part of
 * @param parentReplyId    if a reply is nested, we want to keep track of what reply it is nested inside of so we take its parents id
 * @param replies          array for accumulated nested replies
 * @returns                accumulated replies after we've gone through all of them
 */
const getRepliesForComment = (
  postId: string,
  commentInfo: CommentDetails,
  commentAuthor: string,
  parentCommentId: string,
  parentReplyId: string | null,
  replies: IStory[]
) => {
  // If there are no replies, return and continue looking through the rest of the replies
  if (
    commentInfo.replies === undefined ||
    commentInfo.replies.data === undefined ||
    commentInfo.replies.data.children.length === 0
  ) {
    return;
  }
  // Loop through all the replies for this comment
  const commentDetails = commentInfo.replies.data.children;
  const commentDetailsLength = commentDetails.length;

  for (let i = 0; i < commentDetailsLength; i++) {
    const val = commentDetails[i];
    const { author, body, body_html, created_utc, id, replies: repliesForReply, permalink, score } = val.data;
    if (body_html === undefined || id === '_') {
      return;
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
      postId: postId,
    };
    // Add this reply to the list of accumulated relies
    replies.push(reply);
    // Recursively call this function again on the current reply we are on to check for if it has replies as well.
    // We go through all nested replies
    getRepliesForComment(postId, val.data, commentAuthor, parentCommentId, id, replies);
    // }
  }

  return replies;
};

export const normalizedReplies = (replies: Comment[]) => {
  let normalizedReplies: NormalizedReplies = {};

  replies.forEach((reply, index) => {
    normalizedReplies[reply.id] = {
      ...reply,
      replies: [...replies.filter((val) => val.replyId === reply.id).map((val) => val.id)],
    };
  });

  return normalizedReplies;
};
