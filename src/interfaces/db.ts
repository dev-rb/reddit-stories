import { Post, Story, Reply } from '@prisma/client';

export interface ExtendedReply extends Reply {
    replies: ExtendedReply[]
}

export type Replies = { replies: ExtendedReply[] }

export type StoryAndReplies = Story & { replies: Reply[] }
export type StoryAndExtendedReplies = Story & { replies: ExtendedReply[] }

export type StoriesAndReplies = { stories: StoryAndReplies[] }

export interface Prompt extends Post {
    totalComments: number,
    liked?: boolean,
    saved?: boolean
    readLater?: boolean
}

export type PromptAndStories = Prompt & { stories: Story[] };

export type PromptAndStoriesWithReplies = (Prompt & StoriesAndReplies)

export type PromptAndStoriesWithExtendedReplies = (Prompt & { stories: StoryAndExtendedReplies[] })