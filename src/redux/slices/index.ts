import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";
import { PromptAndStoriesWithExtendedReplies } from "src/interfaces/db";
import { persistor } from "../store";

interface PostStateItem extends PromptAndStoriesWithExtendedReplies {
    downloaded: boolean,
    isSaved?: boolean,
    isReadLater?: boolean
}

export interface PostsState {
    hot: {
        posts: PostStateItem[]
    },
    new: {
        posts: PostStateItem[]
    },
    top: {
        [key: string]: {
            posts: PostStateItem[]
        }
    }
}

const initialState: PostsState = {
    hot: {
        posts: []
    },
    new: {
        posts: []
    },
    top: {
        day: {
            posts: []
        },
        week: {
            posts: []
        },
        month: {
            posts: []
        },
        year: {
            posts: []
        },
        all: {
            posts: []
        }
    }
}

const PostsSlice = createSlice({
    name: 'PostsSlice',
    initialState: initialState,
    reducers: {
        downloadPosts: (state: PostsState, { payload }: PayloadAction<{ posts: PromptAndStoriesWithExtendedReplies[], sortType: string, timeSort?: string }>) => {
            for (const post of payload.posts) {
                if (payload.sortType === 'hot') {
                    state.hot.posts.push({ ...post, downloaded: true });
                } else if (payload.sortType === 'new') {
                    state.new.posts.push({ ...post, downloaded: true });

                } else {
                    if (payload.timeSort) {
                        state.top[payload.timeSort].posts.push({ ...post, downloaded: true });
                    } else {
                        state.top['day'].posts.push({ ...post, downloaded: true });
                    }
                }
            }
        },
        clearDownloadedPosts: (state: PostsState, { payload }: PayloadAction<{ sortType: string, timeSort?: string }>) => {
            if (payload.sortType === 'hot' || payload.sortType === 'new') {
                state[payload.sortType].posts = [];
            } else {
                if (payload.timeSort) {
                    state.top[payload.timeSort].posts = [];
                } else {
                    state.top['day'].posts = [];
                }
            }
            // Object.assign(state, { ...initialState });
            console.log("Reducer")
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

export const downloadedPostsSelector = (state: PostsState, options: { sortType: string, timeSort?: string }) => {
    if (options.sortType === 'hot' || options.sortType === 'new') {
        return state[options.sortType].posts;
    } else {
        if (options.timeSort) {
            return state.top[options.timeSort].posts;
        } else {
            return state.top['day'].posts;
        }
    }
};

export const postSelector = (state: PostsState, postId: string) => {
    console.log("Post selector called")
    const hotCheck = state.hot.posts.find((val) => val.id === postId)
    if (hotCheck) {
        return hotCheck;
    }
    const newCheck = state.new.posts.find((val) => val.id === postId);
    if (newCheck) {
        return newCheck;
    }

    const topKeys = Object.keys(state.top)
    for (const key of topKeys) {
        const topCheck = state.top[key].posts.find((post) => post.id === postId);
        console.log(topCheck, key)
        if (topCheck) {
            return topCheck
        }
    }

}