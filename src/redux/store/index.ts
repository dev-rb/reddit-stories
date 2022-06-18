import { configureStore } from "@reduxjs/toolkit";
import { postsApi } from "../services";

export const store = configureStore({
    reducer: {
        [postsApi.reducerPath]: postsApi.reducer
    },

    middleware: (defaultMid) => {
        return defaultMid().concat(postsApi.middleware);
    }
});