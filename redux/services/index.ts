import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const postsApi = createApi({
    reducerPath: 'postsApi',
    baseQuery: fetchBaseQuery({ baseUrl: 'https://www.reddit.com/' }),
    endpoints: (builder) => ({
        getPosts: builder.query
    })
});