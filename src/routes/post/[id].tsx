import { useParams } from '@solidjs/router';
import { QueryClient, QueryKey, createQuery, useQueryClient } from '@tanstack/solid-query';
import { createSignal, onMount } from 'solid-js';
import { persister } from '~/app';
import { KEBAB_SORT_VALUES } from '~/constants/sort';
import { Prompt } from '~/types';
import { RedditPost } from '~/types/reddit';
import { Comments, fetchCommentsForPost } from '~/utils/reddit';

type QueryPostsData = { persisted: boolean; prompts: Prompt[] };

const getPost = async (id: string, queryClient: QueryClient) => {
  const persisted = await persister.get(`comments.${id}`)?.then((d) => {
    return d;
  });

  if (persisted) {
    const queryCache: [QueryKey, QueryPostsData | undefined][] = queryClient.getQueriesData({ queryKey: ['posts'] });
    const postId: string = persisted[0];

    console.log(persisted);
    let prompt: Prompt | undefined;
    for (const data of queryCache) {
      const _data = data[1];
      if (!_data) continue;

      prompt = _data.prompts.find((p) => p.id === postId);
    }

    return { post: [prompt, persisted[1]] as [Prompt, Comments], persisted: true };
  }

  const comments = await fetchCommentsForPost('/r/writingprompts', id);

  return { post: [id, comments], persisted: false };
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
      <div class="text-sm color-white">{JSON.stringify(post.data?.post?.[0])}</div>
    </div>
  );
};

export default Post;
