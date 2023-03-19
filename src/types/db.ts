import { Post, Comment } from '@prisma/client';

export interface IStory extends Comment {
  liked?: boolean;
  favorited?: boolean;
  readLater?: boolean;
}

export interface Comments {
  [key: string]: IStory & { replies: string[] };
}

export interface Prompt extends Post {
  totalComments: number;
  liked?: boolean;
  favorited?: boolean;
  readLater?: boolean;
  userRead?: boolean;
}
