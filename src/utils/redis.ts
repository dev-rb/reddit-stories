import { Redis } from '@upstash/redis';
import { Prompt } from 'src/types/db';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!
});

export const getPosts = async (sortType: string, timeSort?: string | null) => {
    const postsKey = `${sortType}${timeSort ? '::' + timeSort : ''}`

    return await redis.get(postsKey) as string;
}

export const addPosts = async (posts: Prompt[], sortType: string, timeSort?: string | null) => {
    const postsKey = `${sortType}${timeSort ? '::' + timeSort : ''}`
    await redis.set(postsKey, JSON.stringify(posts), { ex: 60 * 60 * 6 });
}