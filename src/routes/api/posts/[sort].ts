import { APIEvent } from '@solidjs/start/server';
import { KebabSortTypes, Posts } from '~/types';
import { extractPostDetails } from '~/utils/reddit';
import { RedisCache } from '~/utils/redis';

export async function GET(event: APIEvent) {
  const sort = event.params.sort as KebabSortTypes | undefined;
  if (!sort) return new Response('No sort provided', { status: 400 });
  const prompts = await RedisCache.getPosts(sort);
  if (!prompts.length) {
    const sortType = sort.includes('top') ? 'top' : sort;
    const timeSort = sort.includes('top') ? `t=${sort.split('-')[1]}&` : '';
    const count = 100;
    const postsData: Posts = await (
      await fetch(`https://www.reddit.com/r/writingprompts/${sortType}.json?${timeSort}limit=${count}&raw_json=1`)
    ).json();

    const prompts = postsData.data.children.map(extractPostDetails);

    await RedisCache.addPosts(prompts, sort);

    return prompts;
  }
  return prompts;
}
