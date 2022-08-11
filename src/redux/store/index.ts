import { configureStore } from "@reduxjs/toolkit";
import { set, get, del } from "idb-keyval";
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from "redux-persist";
import { postsApi } from "../services";
import { clearDownloadedPosts, PostsReducer, PostsState } from "../slices";

function createIDBPersister(idbValidKey: IDBValidKey = "reduxPersist") {
    return {
        setItem: async (key: string, posts: PostsState) => {
            await set(key, posts);
        },
        getItem: async (key: string) => {
            return await get<PostsState>(key);
        },
        removeItem: async (key: string) => {
            await del(key);
        },
    };
}


const persistConfig = {
    key: 'root',
    storage: createIDBPersister(),
    serialize: false,
    deserialize: false
}

const persistedReducer = persistReducer(persistConfig, PostsReducer)
export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});
export const persistor = persistStore(store)

export const clearStorePosts = async ({ sortType, timeSort }: { sortType: string, timeSort?: string }) => {
    await persistor.purge();
    store.dispatch(clearDownloadedPosts({ sortType, timeSort }))
    await persistor.flush();
}