import { db } from '~/app';
import { Prompt, Posts } from '~/types';
import { extractPostDetails } from './reddit';

export const getPosts = async (sort: string) => {
  const sortType = sort.includes('top') ? 'top' : sort;
  const timeSort = sort.includes('top') ? `t=${sort.split('-')[1]}&` : '';
  const count = 100;

  const persisted = await db.raw(async (db) => {
    const tx = db.transaction('posts');
    const index = tx.store.index('sortIndex');

    let cursor = await index.openKeyCursor(sort);

    let results = [];

    while (cursor) {
      results.push(index.get(cursor.key));

      cursor = await cursor.continue();
    }

    return Promise.all(results);
  });

  if (persisted.length) {
    return { prompts: persisted as Prompt[], persisted: true };
  }

  const postsData: Posts = await (
    await fetch(`https://www.reddit.com/r/writingprompts/${sortType}.json?${timeSort}limit=${count}&raw_json=1`)
  ).json();

  console.log('Fetch data');
  const prompts = postsData.data?.children.map(extractPostDetails);

  return { prompts: prompts, persisted: false };
};
