import { useParams } from '@solidjs/router';
import { QueryClient, QueryKey, createQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, onMount } from 'solid-js';
import { db } from '~/app';
import { Comment, Prompt } from '~/types';
import { Comments, fetchCommentsForPost } from '~/utils/reddit';

type QueryPostsData = { persisted: boolean; prompts: Prompt[] };

const getPost = async (id: string, queryClient: QueryClient) => {
  const persistedComments = await db.raw(async (db) => {
    const tx = db.transaction('comments', 'readwrite');
    const store = tx.store.index('commentsIndex');
    let cursor = await store.openKeyCursor(id);

    let results: Comment[] = [];

    while (cursor) {
      results.push(await store.get(cursor.key));
      cursor = await cursor.continue();
    }
    return results;
  });

  const persistedPrompt: Prompt | undefined = await db.get('posts', id);

  if (persistedComments.length) {
    if (persistedPrompt) {
      return { post: [persistedPrompt, persistedComments], persisted: true };
    }
    const queryCache: [QueryKey, QueryPostsData | undefined][] = queryClient.getQueriesData({ queryKey: ['posts'] });
    const postId: string = id;

    let prompt: Prompt | undefined = persistedPrompt;
    for (const data of queryCache) {
      const _data = data[1];
      if (!_data) continue;

      prompt = _data.prompts.find((p) => p.id === postId);
    }

    return { post: [prompt, persistedComments] as [Prompt, Comment[]], persisted: true };
  }

  console.log('Fetch comments from reddit');
  const comments = await fetchCommentsForPost('/r/writingprompts', id);

  return { post: comments, persisted: false };
};

const Post = () => {
  const [mounted, setMounted] = createSignal(false);
  const params = useParams();
  const queryClient = useQueryClient();

  const id = () => params.id;

  const post = createQuery(() => ({
    enabled: mounted(),
    queryKey: ['comments', id()],
    queryFn: async () => {
      return await getPost(id(), queryClient);
    },
    refetchOnMount: true,
  }));

  onMount(() => {
    setMounted(true);
  });

  return (
    <div class="flex flex-col gap-4">
      <div class="text-sm color-white">{JSON.stringify(post.data?.post)}</div>
    </div>
  );
};

export default Post;
