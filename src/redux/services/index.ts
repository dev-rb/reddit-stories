import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { fetchStoriesForPostWithId, formatStoriesData, getAllPrompts } from '../../helpers/cleanData';
import { fetchFromUrl } from '../../helpers/fetchData';
import { CommentDetails, IPost, Posts } from '../../interfaces/reddit';

export type PostSortType = 'hot' | 'new' | 'rising';

export const postsApi = createApi({
    reducerPath: 'postsApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://www.reddit.com/' }),
    endpoints: (builder) => ({
        getPosts: builder.query<IPost[], PostSortType>({
            queryFn: async (type) => {
                return { data: getAllPrompts(await fetchFromUrl(`/r/writingprompts/${type}`), type) }
            }
        }),
        getCommentsForPost: builder.query<CommentDetails[], string>({
            queryFn: async (id) => {
                return { data: await fetchStoriesForPostWithId(id) }
            }
        })
    })
});

export const { useGetPostsQuery, useGetCommentsForPostQuery } = postsApi;