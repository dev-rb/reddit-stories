import { Comment, Prompt } from '~/types/app';
import { PostInfo, RedditCommentRoot, CommentDetails } from '~/types/reddit';

export type Comments = { [key: string]: Comment };

export const extractPostDetails = (postInfo: PostInfo): Prompt => {
  const { author, created_utc, id, permalink, score, title, num_comments } = postInfo.data;

  return {
    author,
    created: new Date(created_utc * 1000).toString(),
    id,
    permalink,
    score,
    title,
    totalComments: num_comments,
    stories: [],
    downloaded: false,
  };
};

export const fetchCommentsForPost = async (subreddit: string, postId: string) => {
  let data: RedditCommentRoot = await (
    await fetch(`https://www.reddit.com${subreddit}/comments/${postId}.json?raw_json=1`)
  ).json();
  const commentDetails = data[1].data.children;
  const postDetails = data[0].data.children[0];

  const filteredComments = commentDetails.filter(
    (comment) => comment.data.author !== 'AutoModerator' && (comment.kind === 't1' || comment.kind === 'Listing')
  );

  let map: Comments = {};

  for (const comment of filteredComments) {
    extractCommentDetails(comment.data, undefined, undefined, postId, map);
  }

  return [extractPostDetails(postDetails), map] as const;
};

const extractCommentDetails = (
  commentInfo: CommentDetails,
  mainCommentId: string | undefined,
  replyingToId: string | undefined,
  postId: string,
  map: Comments
) => {
  const { author, created_utc, id, permalink, score, title, body, body_html, replies } = commentInfo;

  const comment: Comment = {
    author,
    created: created_utc,
    id,
    permalink,
    score,
    body,
    postId,
    bodyHtml: body_html,
    replies: [],
    mainCommentId,
    replyingTo: replyingToId,
    ups: score,
    title: title,
  };

  map[id] = comment;

  if (replyingToId) {
    const currentValue = map[replyingToId];
    if (currentValue) {
      map[replyingToId] = {
        ...currentValue,
        replies: [...currentValue.replies, id],
      };
    }
  }

  if (replies === undefined || replies.data === undefined || replies.data.children.length === 0) {
    return map;
  }

  if (!replyingToId && !mainCommentId) {
    mainCommentId = id;
  }

  const filteredReplies = replies.data.children.filter(
    (v) => v.data.author !== 'AutoModerator' && (v.kind === 't1' || v.kind === 'Listing')
  );

  for (const reply of filteredReplies) {
    extractCommentDetails(reply.data, mainCommentId, id, postId, map);
  }

  return map;
};
