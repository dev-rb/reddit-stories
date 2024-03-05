import { Redis } from '@upstash/redis';
import { KebabSortTypes, Prompt } from '~/types';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RedisCache {
  static getPosts = async (sortType: string): Promise<Prompt[] | null> => {
    const data: string | null = await redis.get(sortType);
    if (!data) return null;

    return JSON.parse(data);
  };

  static addPosts = async (posts: Prompt[], sortType: KebabSortTypes) => {
    await redis.set(sortType, JSON.stringify(posts), { ex: 60 * 60 * 6 });
  };
}
