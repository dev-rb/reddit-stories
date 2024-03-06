import { APIEvent } from '@solidjs/start/server';
import { fetchCommentsForPost } from '~/utils/reddit';
import { RedisCache } from '~/utils/redis';

export async function GET(event: APIEvent) {
  const postId = event.params.id;
  if (!postId) return new Response('No post id provided', { status: 400 });
  // const stories = await RedisCache.getStories(postId);

  const comments = await fetchCommentsForPost(postId);
  return comments;
  // if (stories && !Object.keys(stories[1]).length) {
  //   const comments = await fetchCommentsForPost(postId);
  //   console.log('fetch from reddit');
  //
  //   // await RedisCache.addStories(postId, comments[1]);
  //
  //   return comments;
  // }
  // return stories;
}
