import { Post, Comment } from '@prisma/client';

export interface IStory extends Comment {
    liked?: boolean,
    favorited?: boolean
    readLater?: boolean
}

export interface NormalizedReplies {
    [key: string]: IStory & { replies: string[] }
}

export interface ExtendedReply extends IStory {
    replies: ExtendedReply[]
}

export type Replies = { replies: ExtendedReply[] }

export type StoryAndReplies = IStory & { replies: Comment[] }
export type StoryAndExtendedReplies = IStory & { replies: ExtendedReply[] }
export type StoryAndNormalizedReplies = IStory & { replies: NormalizedReplies }

export type StoriesAndReplies = { stories: StoryAndReplies[] }

export interface Prompt extends Post {
    totalComments: number,
    liked?: boolean,
    favorited?: boolean
    readLater?: boolean,
    userRead?: boolean
}

export type PromptAndStories = Prompt & { stories: IStory[] };

export type PromptAndStoriesWithReplies = (Prompt & StoriesAndReplies)

export type PromptAndStoriesWithExtendedReplies = (Prompt & { stories: StoryAndExtendedReplies[] })

export type PromptAndStoriesWithNormalizedReplies = (Prompt & { stories: StoryAndNormalizedReplies[] })