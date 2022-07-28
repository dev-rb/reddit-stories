import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { ExtendedReply, IStory, Prompt, PromptAndStoriesWithExtendedReplies, StoryAndExtendedReplies } from "src/interfaces/db";
import { persistor } from "../store";

export type PostStatus = 'liked' | 'readLater' | 'saved'

interface PostStateItem extends Prompt {
    sortType: string,
    timeSort?: string,
    downloaded: boolean,
}

interface CommentStateItem extends IStory {
    downloaded: boolean
}

type CommentWithReplies = CommentStateItem & { replies: ExtendedReply[] }

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
        updatePostStatus: (state: PostsState, { payload }: PayloadAction<{ postId: string, storyId?: string, statusToUpdate: PostStatus, newStatusValue: boolean }>) => {
            if (payload.storyId !== undefined) {
                console.log(payload.storyId)
                state.stories[payload.postId] = state.stories[payload.postId].map((story) => {
                    if (story.id === payload.storyId) {
                        story[payload.statusToUpdate] = payload.newStatusValue;
                    }

                    return story;

                })
                return;
            }
            state.posts = state.posts.map((val) => {
                if (val.id === payload.postId) {
                    val[payload.statusToUpdate] = payload.newStatusValue;
                }
                return val;
            })
        },
        downloadPost: (state: PostsState, { payload }: PayloadAction<{ post: PromptAndStoriesWithExtendedReplies, sortType: string, timeSort?: string }>) => {
            console.log("Download post called")
            state.posts.push({ ...payload.post, downloaded: true, sortType: payload.sortType, timeSort: payload.timeSort });
        },
        downloadPosts: (state: PostsState, { payload }: PayloadAction<{ posts: PromptAndStoriesWithExtendedReplies[], sortType: string, timeSort?: string }>) => {
            for (const post of payload.posts) {
                // if (payload.sortType === 'hot') {
                //     state.hot.posts.push({ ...post, downloaded: true });
                // } else if (payload.sortType === 'new') {
                //     state.new.posts.push({ ...post, downloaded: true });

                // } else {
                //     if (payload.timeSort) {
                //         state.top[payload.timeSort].posts.push({ ...post, downloaded: true });
                //     } else {
                //         state.top['day'].posts.push({ ...post, downloaded: true });
                //     }
                // }
                const { stories, ...rest } = post;
                state.stories[rest.id] = [...stories.map((val) => ({ ...val, downloaded: true }))];
                state.posts.push({ ...rest, downloaded: true, sortType: payload.sortType, timeSort: payload.timeSort });
            }
        },
        clearDownloadedPosts: (state: PostsState, { payload }: PayloadAction<{ sortType: string, timeSort?: string }>) => {
            state.posts = [...state.posts.filter((post) => {
                const isSameSort = post.sortType === payload.sortType;
                const isSameTimeSort = post.timeSort === payload.timeSort;
                const isSaved = post.saved === true;
                const isReadLater = post.readLater === true;

                return !(isSameSort || isSameTimeSort || isSaved || isReadLater) && post.downloaded;
            })]
            //     if (payload.sortType === 'hot' || payload.sortType === 'new') {
            //     state[payload.sortType].posts = [];
            // } else {
            //     if (payload.timeSort) {
            //         state.top[payload.timeSort].posts = [];
            //     } else {
            //         state.top['day'].posts = [];
            //     }
            // }
            // state.hot.posts = state.hot.posts.filter((val) => (val.isReadLater || val.isSaved));
            // state.new.posts = state.new.posts.filter((val) => (val.isReadLater || val.isSaved));
            // const topKeys = Object.keys(state.top)
            // for (const key of topKeys) {
            //     state.top[key].posts = state.top[key].posts.filter((post) => post.isReadLater || post.isSaved);

            // }
        }
    }

});

export const {
    downloadPost,
    downloadPosts,
    clearDownloadedPosts,
    updatePostStatus
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
        return { ...found };
    }

}

export const postDownloadStatus = (state: PostsState, postId: string) => {
    const found = state.posts.find((post) => post.id === postId);

    if (found) {
        return found.downloaded;
    }
}


export const commentDownloadStatus = (state: PostsState, postId: string, commentId: string) => {
    const found = state.stories[postId];

    if (found !== undefined) {
        return found.find((val) => val.id === commentId)?.downloaded;
    }
}