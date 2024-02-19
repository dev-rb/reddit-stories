export interface Prompt {
  title: string;
  id: string;
  created: string;
  score: number;
  author: string;
  permalink: string;
  totalComments: number;
  downloaded: boolean;
  stories: Comment[];
}

export interface Comment {
  postId: string;
  replyingTo?: string;
  mainCommentId?: string;
  title: string;
  body: string;
  bodyHtml: string;
  permalink: string;
  score: number;
  ups: number;
  author: string;
  id: string;
  created: number;
  replies: string[];
}