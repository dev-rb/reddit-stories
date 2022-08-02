import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IStory, NormalizedReplies, Prompt, PromptAndStoriesWithNormalizedReplies } from "src/interfaces/db";
import { PostStatus } from "src/server/routers/post";

interface PostStateItem extends Prompt {
    sortType: string,
    timeSort?: string,
    downloaded: boolean,
}

interface CommentStateItem extends IStory {
    downloaded: boolean
}

interface NormalizedRepliesDownload {
    [key: string]: CommentStateItem & { replies: string[] }
}

type CommentWithReplies = CommentStateItem & { replies: NormalizedRepliesDownload }

const downloadReplies = (replies: NormalizedReplies) => {
    const newReplies: NormalizedRepliesDownload = {}
    Object.keys(replies).forEach((key) => {
        newReplies[key] = { ...replies[key], downloaded: true };
    })

    return newReplies;
}

export interface PostsState {
    posts: PostStateItem[],
    stories: { [key: string]: CommentWithReplies[] }
}

const initialState: PostsState = {
    posts: [],
    stories: {}
}

const PostsSlice = createSlice({
    name: 'PostsSlice',
    initialState: initialState,
    reducers: {
        updateReplyStatus: (state: PostsState, { payload }: PayloadAction<{ postId: string, storyId: string, replyId: string, statusToUpdate: PostStatus, newStatusValue: boolean }>) => {
            if (payload.storyId !== undefined) {
                console.log("Update reply local called")
                console.log(payload.storyId)
                if (state.stories[payload.postId] === undefined) return;
                state.stories[payload.postId] = state.stories[payload.postId].map((story) => {
                    if (story.id === payload.storyId) {
                        story.replies[payload.replyId][payload.statusToUpdate] = payload.newStatusValue;
                    }

                    return story;

                })
                return;
            }
        },
        updateStoryStatus: (state: PostsState, { payload }: PayloadAction<{ postId: string, storyId: string, statusToUpdate: PostStatus, newStatusValue: boolean }>) => {
            if (payload.storyId !== undefined) {
                console.log("Update story local called")
                console.log(payload.storyId)
                if (state.stories[payload.postId] === undefined) return;
                state.stories[payload.postId] = state.stories[payload.postId].map((story) => {
                    if (story.id === payload.storyId) {
                        story[payload.statusToUpdate] = payload.newStatusValue;
                    }

                    return story;

                })
                return;
            }
        },
        updatePostStatus: (state: PostsState, { payload }: PayloadAction<{ postId: string, statusToUpdate: PostStatus | 'userRead', newStatusValue: boolean }>) => {

            state.posts = state.posts.map((val) => {
                if (val.id === payload.postId) {
                    val[payload.statusToUpdate] = payload.newStatusValue;
                }
                return val;
            })
        },
        downloadPost: (state: PostsState, { payload }: PayloadAction<{ post: PromptAndStoriesWithNormalizedReplies, sortType: string, timeSort?: string }>) => {
            console.log("Download post called")
            state.posts.push({ ...payload.post, downloaded: true, sortType: payload.sortType, timeSort: payload.timeSort });
            state.stories[payload.post.id] = [...payload.post.stories.map((val, index) => ({ ...val, downloaded: true, replies: { ...downloadReplies(val.replies), } }))];
        },
        downloadPosts: (state: PostsState, { payload }: PayloadAction<{ posts: PromptAndStoriesWithNormalizedReplies[], sortType: string, timeSort?: string }>) => {
            for (const post of payload.posts) {
                const { stories, ...rest } = post;

                state.stories[rest.id] = [...stories.map((val, index) => ({ ...val, downloaded: true, replies: { ...downloadReplies(val.replies), } }))];
                state.posts.push({ ...rest, downloaded: true, sortType: payload.sortType, timeSort: payload.timeSort });
            }
        },
        clearDownloadedPosts: (state: PostsState, { payload }: PayloadAction<{ sortType: string, timeSort?: string }>) => {
            const filteredPosts = [...state.posts.filter((post) => {
                const isSameSort = post.sortType === payload.sortType;
                const isSameTimeSort = post.timeSort === payload.timeSort;
                const isSaved = post.favorited === true;
                const isReadLater = post.readLater === true;
                return !(isSameSort || isSameTimeSort || isSaved || isReadLater) && post.downloaded;
            })]
            state.posts = filteredPosts;
            const filteredStories = Object.keys(state.stories).filter((key) => filteredPosts.some((val) => val.id === key)).reduce((prev: { [key: string]: any }, key) => {
                prev[key] = state.stories[key];
                return prev;
            }, {})
            state.stories = filteredStories
        }
    }

});

export const {
    downloadPost,
    downloadPosts,
    clearDownloadedPosts,
    updatePostStatus,
    updateReplyStatus,
    updateStoryStatus
} = PostsSlice.actions

export const PostsReducer = PostsSlice.reducer;

export const downloadedPostsSelector = createSelector(
    [
        ({ posts }: PostsState) => posts,
        (options: { sortType: string, timeSort?: string }) => options
    ],
    (items, options) => {
        // console.log("Downloaded posts selector: ", options)
        return items.filter((post) => (post.sortType === options.sortType && post.timeSort === options.timeSort) === true)
    });

export const postSelector = (state: PostsState, postId: string) => {
    const found = state.posts.find((post) => post.id === postId);

    if (found) {
        return found;
    }

}

export const getPostStatuses = (state: PostsState, postId: string) => {
    const found = state.posts.find((post) => post.id === postId);
    if (found) {
        const { downloaded, liked, readLater, userRead, favorited } = found;
        return { downloaded, liked, readLater, userRead, favorited } as const;
    }
}

export const commentDownloadStatus = (state: PostsState, postId: string, commentId: string) => {
    const found = state.stories[postId];

    if (found !== undefined) {
        const foundComment = found.find((val) => val.id === commentId)
        if (foundComment) {
            return foundComment.downloaded;
        } else {
            const foundInReplies = found.find((val) => {
                const found = Object.keys(val.replies).find((replyId) => val.replies[replyId].downloaded)

                return found;
            })

            if (foundInReplies) {
                return foundInReplies.downloaded;
            }
        }
    }
}