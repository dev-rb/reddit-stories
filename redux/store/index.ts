import { createStore } from "redux";
import { PostsReducer } from "../slices";

export const store = createStore(PostsReducer);