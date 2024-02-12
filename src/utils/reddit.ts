import { Prompt } from '~/types/app';
import { PostInfo } from '~/types/reddit';

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
  };
};
