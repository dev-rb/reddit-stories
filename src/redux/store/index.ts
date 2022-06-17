import { configureStore } from "@reduxjs/toolkit";
import { createStore } from "redux";
import { postsApi } from "../services";
import { PostsReducer } from "../slices";

export const store = configureStore({
    reducer: {
        [postsApi.reducerPath]: postsApi.reducer
    },

    middleware: (defaultMid) => {
        return defaultMid().concat(postsApi.middleware);
    }
});