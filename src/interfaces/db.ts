import { Post, Story, Reply } from '@prisma/client';

export interface ExtendedReply extends Reply {
    replies: ExtendedReply[]
}

export type Replies = { replies: ExtendedReply[] }

export type StoriesAndReplies = { stories: (Story & Replies)[] }

export interface Prompt extends Post {
    totalStories: number
}

export type PromptAndStories = Prompt & Story;

export type PromptAndStoriesWithReplies = (Prompt & StoriesAndReplies)
