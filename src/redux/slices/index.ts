import { createSelector, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Prompt, Comments } from 'src/types/db';
import { PostStatus } from 'src/server/routers/post';

interface PostStateItem extends Prompt {
  sortType: string;
  timeSort?: string;
  downloaded: boolean;
}

type CommentStateItem = { [Key in keyof Comments]: Comments[Key] & { downloaded: boolean } };

const downloadComments = (comments: Comments) => {
  const downloaded: CommentStateItem = {};
  Object.keys(comments).forEach((key) => {
    downloaded[key] = { ...comments[key], downloaded: true };
  });

  return downloaded;
};

export interface PostsState {
  posts: PostStateItem[];
  stories: { [key: string]: CommentStateItem };
}

const initialState: PostsState = {
  posts: [],
  stories: {},
};

const PostsSlice = createSlice({
  name: 'PostsSlice',
  initialState: initialState,
  reducers: {
    updateCommentStatus: (
      state: PostsState,
      {
        payload,
      }: PayloadAction<{
        postId: string;
        commentId: string;
        statusToUpdate: PostStatus;
        newStatusValue: boolean;
      }>
    ) => {
      if (!payload.commentId || state.stories[payload.postId] === undefined) return;
      const comments = Object.values(state.stories[payload.postId]);
      const commentToUpdate = comments.find((story) => story.id === payload.commentId);
      if (commentToUpdate) {
        commentToUpdate[payload.statusToUpdate] = payload.newStatusValue;
      }
    },
    updatePostStatus: (
      state: PostsState,
      { payload }: PayloadAction<{ postId: string; statusToUpdate: PostStatus | 'userRead'; newStatusValue: boolean }>
    ) => {
      const postToUpdate = state.posts.find((post) => post.id === payload.postId);

      if (!postToUpdate) return;

      postToUpdate[payload.statusToUpdate] = payload.newStatusValue;
    },
    downloadPost: (
      state: PostsState,
      { payload }: PayloadAction<{ post: Prompt & { stories: Comments }; sortType: string; timeSort?: string }>
    ) => {
      state.posts.push({ ...payload.post, downloaded: true, sortType: payload.sortType, timeSort: payload.timeSort });
      state.stories[payload.post.id] = downloadComments(payload.post.stories);
    },
    downloadPosts: (
      state: PostsState,
      { payload }: PayloadAction<{ posts: (Prompt & { stories: Comments })[]; sortType: string; timeSort?: string }>
    ) => {
      console.time('Download');
      for (const post of payload.posts) {
        const { stories, ...rest } = post;

        console.time(`Download comments for post ${rest.id}`);
        state.stories[rest.id] = downloadComments(stories);
        console.timeEnd(`Download comments for post ${rest.id}`);

        state.posts.push({ ...rest, downloaded: true, sortType: payload.sortType, timeSort: payload.timeSort });
      }
      console.timeEnd('Download');
    },
    clearDownloadedPosts: (state: PostsState, { payload }: PayloadAction<{ sortType: string; timeSort?: string }>) => {
      const filteredPosts = [
        ...state.posts.filter((post) => {
          const isSameSort = post.sortType === payload.sortType;
          const isSameTimeSort = post.timeSort === payload.timeSort;
          const isSaved = post.favorited === true;
          const isReadLater = post.readLater === true;
          return !(isSameSort || isSameTimeSort || isSaved || isReadLater) && post.downloaded;
        }),
      ];
      state.posts = filteredPosts;
      const filteredStories = Object.keys(state.stories)
        .filter((postId) => filteredPosts.some((val) => val.id === postId))
        .reduce(
          (prev, key) => {
            prev[key] = state.stories[key];
            return prev;
          },
          {} as {
            [key: string]: CommentStateItem;
          }
        );
      state.stories = filteredStories;
    },
  },
});

export const { downloadPost, downloadPosts, clearDownloadedPosts, updatePostStatus, updateCommentStatus } =
  PostsSlice.actions;

export const PostsReducer = PostsSlice.reducer;

export const downloadedPostsSelector = createSelector(
  [({ posts }: PostsState) => posts, (options: { sortType: string; timeSort?: string }) => options],
  (items, options) => {
    return items.filter((post) => (post.sortType === options.sortType && post.timeSort === options.timeSort) === true);
  }
);

export const postSelector = (state: PostsState, postId: string) => {
  const found = state.posts.find((post) => post.id === postId);

  if (found) {
    return found;
  }
};

export const getPostStatuses = (state: PostsState, postId: string) => {
  const found = state.posts.find((post) => post.id === postId);
  if (found) {
    const { downloaded, liked, readLater, userRead, favorited } = found;
    return { downloaded, liked, readLater, userRead, favorited };
  }
};

export const getCommentStatuses = (state: PostsState, postId: string, commentId: string) => {
  const found = state.stories[postId];

  if (found !== undefined) {
    const foundComment = found[commentId];
    if (foundComment) {
      const { downloaded, liked, readLater, favorited } = foundComment;
      return { downloaded, liked, readLater, favorited };
    }
  }
};
