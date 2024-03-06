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
  const persisted = await getPersistedPosts(sort);

  if (persisted && persisted.length) {
    return { prompts: persisted, persisted: true };
  }

  const prompts: Prompt[] = await (await fetch(`/api/posts/${sort}`)).json();

  log('info', 'Fetch data');
  await db.raw(async (db) => {
    const tx = db.transaction('posts', 'readonly');
    const store = tx.store;
    for (const prompt of prompts) {
      const hasPost = await store.get(prompt.id);
      if (hasPost) {
        prompt.downloaded = true;
      }
    }
  });
  console.log(prompts);

  return { prompts: prompts, persisted: false };
};
