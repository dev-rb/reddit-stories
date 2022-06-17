import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPost } from "../../interfaces/reddit";

export interface PostsState {
    posts: IPost[]
}

const initialState: PostsState = {
    posts: []
}

const PostsSlice = createSlice({
    name: 'PostsSlice',
    initialState: initialState,
    reducers: {
        addPosts: (state: PostsState, { payload }: PayloadAction<IPost[]>) => {
            state.posts = payload;
        }
    }

});

export const {
    addPosts
} = PostsSlice.actions

export const PostsReducer = PostsSlice.reducer;