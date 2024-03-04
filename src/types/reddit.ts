export type RedditSortType = 'hot' | 'new' | 'top';

export interface Posts {
  kind: string;
  data: RedditPost;
}

export interface RedditPost {
  children: PostInfo[];
}

export interface PostInfo {
  kind: string;
  data: PostDetails;
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
  selftext: string;
  selftext_html: string;
}

export interface RedditComment {
  children: { kind: 't1' | 'more' | 'Listing'; data: CommentDetails }[];
}

export type RedditCommentRoot = [Posts, { kind: string; data: RedditComment }];

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
  replies: { kind: string; data: RedditComment };
}
