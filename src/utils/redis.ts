import { Redis } from '@upstash/redis';
import { KebabSortTypes, Prompt } from '~/types';
import { log } from './common';
import { Comments } from './reddit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class RedisCache {
  static getStories = async (promptId: string): Promise<[Prompt, Comments] | undefined> => {
    let result;
    try {
      const data = await redis.get<Prompt>(promptId);

      if (!data) return result;

      return [data, data.stories];
    } catch (e) {
      log('error', 'Failed to get comments from redis: ', e);
    }

    return result;
  };

  static addStories = async (promptId: string, comments: Comments) => {
    try {
      const t = await redis.json.set(promptId, 'stories', comments);
      console.log(t);
    } catch (e) {
      log('error', 'Failed to add comments to redis');
    }
  };

  static getPosts = async (sortType: string): Promise<Prompt[]> => {
    const data: Prompt[] | null = await redis.get(sortType);

    if (!data) return [];

    return data;
  };

  static addPosts = async (posts: Prompt[], sortType: KebabSortTypes) => {
    await redis.set(sortType, JSON.stringify(posts), { ex: 60 * 60 * 6 });
  };
}
