// export interface Reddit {
//     kind: string;
//     data: Data;
// }
// export interface Data {
//     after: string;
//     children?: (ChildrenEntity)[] | null;
//     before?: null;
// }
// export interface ChildrenEntity {
//     kind: string;
//     data: Data1;
// }
// export interface Data1 {
//     subreddit: string;
//     title: string;
//     downs: number;
//     name: string;
//     ups: number;
//     score: number;
//     edited: number | boolean;
//     created: number;
//     archived: boolean;
//     is_crosspostable: boolean;
//     over_18: boolean;
//     spoiler: boolean;
//     locked: boolean;
//     subreddit_id: string;
//     id: string;
//     author: string;
//     num_comments: number;
//     permalink: string;
//     url: string;
//     created_utc: number;
//     num_crossposts: number;
// }

export interface IPost {
    title: string,
    id: string,
    created: { hoursAgo: number, minutesAgo: number, daysAgo: number },
    score: number,
    author: string,
    permalink: string,
    stories: CommentDetails[]
}

export interface Posts {
    kind: string,
    data: Post
}

export interface Post {
    children: PostInfo[]
}

export interface PostInfo {
    kind: string,
    data: PostDetails
}

export interface PostDetails {
    body: string,
    body_html: string,
    subreddit: string;
    title: string;
    downs: number;
    name: string;
    ups: number;
    score: number;
    edited: number | boolean;
    created: number;
    archived: boolean;
    is_crosspostable: boolean;
    over_18: boolean;
    spoiler: boolean;
    locked: boolean;
    subreddit_id: string;
    id: string;
    author: string;
    num_comments: number;
    permalink: string;
    url: string;
    created_utc: number;
    num_crossposts: number;
}

export interface RedditComment {
    kind: string,
    data: CommentDetails
}

export interface CommentDetails {
    title: string,
    body: string,
    body_html: string
    permalink: string,
    score: number,
    ups: number,
    author: string,
    id: string,
    created: number
}