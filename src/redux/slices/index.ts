import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { PromptAndStoriesWithExtendedReplies } from "src/interfaces/db";
import { persistor } from "../store";

interface PostStateItem extends PromptAndStoriesWithExtendedReplies {
    sortType: string,
    timeSort?: string,
    downloaded: boolean,
    isSaved?: boolean,
    isReadLater?: boolean
}

export interface PostsState {
    posts: PostStateItem[]
}

const initialState: PostsState = {
    posts: []
}

const PostsSlice = createSlice({
    name: 'PostsSlice',
    initialState: initialState,
    reducers: {
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
                state.posts.push({ ...post, downloaded: true, sortType: payload.sortType, timeSort: payload.timeSort });
            }
        },
        clearDownloadedPosts: (state: PostsState, { payload }: PayloadAction<{ sortType: string, timeSort?: string }>) => {
            state.posts = state.posts.filter((post) => {
                const isSameSort = post.sortType === payload.sortType;
                const isSameTimeSort = post.timeSort === payload.timeSort;
                const isSaved = post.isSaved === true;
                const isReadLater = post.isReadLater === true;

                return !(isSameSort || isSameTimeSort || isSaved || isReadLater) && post.downloaded;
            })
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
    downloadPosts,
    clearDownloadedPosts
} = PostsSlice.actions

export const PostsReducer = PostsSlice.reducer;

export const downloadedPostsSelector = createSelector(
    [
        (state: PostsState) => state.posts,
        (options: { sortType: string, timeSort?: string }) => options
    ],
    (items, options) => {
        console.log("Downloaded posts selector: ", options)
        return items.filter((post) => (post.sortType === options.sortType && post.timeSort === options.timeSort) === true)
    });

export const postSelector = (state: PostsState, postId: string) => {
    const found = state.posts.find((post) => post.id === postId);

    if (found) {
        return found;
    }

}