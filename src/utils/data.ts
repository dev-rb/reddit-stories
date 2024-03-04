import { db } from '~/app';
import { Prompt, Posts, Comment } from '~/types';
import { Comments, extractPostDetails } from './reddit';
import { log } from './common';

export const getPersistedPosts = async (sort: string) => {
  const persisted = await db.raw(async (db) => {
    const tx = db.transaction('posts');
    const index = tx.store.index('sortIndex');

    let cursor = await index.openKeyCursor(sort);

    let results = [];

    while (cursor) {
      const prompt = tx.store.get(cursor.primaryKey);
      results.push(prompt);

      cursor = await cursor.continue();
    }

    return (await Promise.all(results)).map((prompt) => {
      prompt.downloaded = true;
      return prompt;
    });
  });

  return persisted as Prompt[];
};

export const getPersistedComments = async (promptId: string) => {
  const data = await db.raw(async (db) => {
    const tx = db.transaction('comments', 'readonly');

    const index = tx.store.index('commentsIndex');
    let cursor = await index.openKeyCursor(promptId);

    let results: Comments = {};

    while (cursor) {
      const comment: Comment = await tx.store.get(cursor.primaryKey);
      results[comment.id] = comment;
      cursor = await cursor.continue();
    }
    return results;
  });

  return data;
};

export const getPosts = async (sort: string) => {
  const sortType = sort.includes('top') ? 'top' : sort;
  const timeSort = sort.includes('top') ? `t=${sort.split('-')[1]}&` : '';
  const count = 100;

  const persisted = await getPersistedPosts(sort);

  if (persisted && persisted.length) {
    return { prompts: persisted, persisted: true };
  }

  const postsData: Posts = await (
    await fetch(`https://www.reddit.com/r/writingprompts/${sortType}.json?${timeSort}limit=${count}&raw_json=1`)
  ).json();

  log('info', 'Fetch data');
  const prompts = postsData.data?.children.map(extractPostDetails);

  return { prompts: prompts, persisted: false };
};
