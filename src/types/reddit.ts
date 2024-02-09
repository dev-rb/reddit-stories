export type RedditSortType = 'hot' | 'new' | 'top';

export interface Post {
  title: string;
  id: string;
  created: string;
  score: number;
  author: string;
  permalink: string;
  stories: CommentDetails[];
}

export interface PostDetails {
  body: string;
  body_html: string;
  subreddit: string;
  title: string;
  downs: number;
  name: string;
  ups: number;
  score: number;
  edited: number | boolean;
  created: number;
  archived: boolean;
  is_crosspostable: boolean;
  over_18: boolean;
  spoiler: boolean;
  locked: boolean;
  subreddit_id: string;
  id: string;
  author: string;
  num_comments: number;
  permalink: string;
  url: string;
  created_utc: number;
  num_crossposts: number;
}

export interface RedditComment {
  children: { kind: 't1' | 'more' | 'Listing'; data: CommentDetails }[];
}

export interface RedditCommentRoot {
  kind: string;
  data: RedditComment;
}

export interface CommentDetails {
  title: string;
  body: string;
  body_html: string;
  permalink: string;
  score: number;
  ups: number;
  author: string;
  id: string;
  created_utc: number;
  replies: RedditCommentRoot;
}
