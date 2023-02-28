import { Post, Comment } from '@prisma/client';

export interface IStory extends Comment {
  liked?: boolean;
  favorited?: boolean;
  readLater?: boolean;
}

export interface NormalizedReplies {
  [key: string]: IStory & { replies: string[] };
}

export type StoryAndNormalizedReplies = IStory & { replies: NormalizedReplies };

export interface Prompt extends Post {
  totalComments: number;
  liked?: boolean;
  favorited?: boolean;
  readLater?: boolean;
  userRead?: boolean;
}

export type PromptAndStories = Prompt & { stories: IStory[] };

export type PromptAndStoriesWithNormalizedReplies = Prompt & { stories: StoryAndNormalizedReplies[] };
