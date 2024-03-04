import { Skeleton } from '@kobalte/core';
import { useParams } from '@solidjs/router';
import { QueryClient, QueryKey, createQuery, useQueryClient } from '@tanstack/solid-query';
import { For, Show, Suspense, createSignal, onMount } from 'solid-js';
import { db } from '~/app';
import { CommentView } from '~/components/CommentView/CommentRoot';
import { CommentsProvider } from '~/components/CommentsContext';
import { Loading } from '~/components/Loading';
import { PostRoot } from '~/components/Post/PostRoot';
import { Prompt } from '~/types';
import { log } from '~/utils/common';
import { getPersistedComments } from '~/utils/data';
import { Comments, fetchCommentsForPost } from '~/utils/reddit';

type QueryPostsData = { persisted: boolean; prompts: Prompt[] };
type QueryCommentsData = { persisted: boolean; post: [Prompt, Comments] };

const getPost = async (id: string, queryClient: QueryClient) => {
  const persistedComments = await getPersistedComments(id);

  const persistedPrompt: Prompt | undefined = await db.get('posts', id);

  if (Object.keys(persistedComments).length) {
    if (persistedPrompt) {
      return { post: [persistedPrompt, persistedComments] as const, persisted: true };
    }
    const queryCache: [QueryKey, QueryPostsData | undefined][] = queryClient.getQueriesData({ queryKey: ['posts'] });
    const postId: string = id;

    let prompt: Prompt | undefined = persistedPrompt;
    for (const data of queryCache) {
      const _data = data[1];
      if (!_data) continue;

      prompt = _data.prompts.find((p) => p.id === postId);
    }

    return { post: [prompt, persistedComments] as const, persisted: true };
  }
  const queryCache = queryClient.getQueryCache().get(JSON.stringify(['comments', id]));

  const data = await queryCache?.state.data;

  if (data && !Array.isArray(data)) {
    return data;
  }

  log('info', 'Fetch comments from reddit', id);
  const comments = await fetchCommentsForPost(id);

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
    staleTime: 0,
  }));

  onMount(() => {
    setMounted(true);
  });

  return (
    <div
      class="flex flex-col w-full gap-2 h-screen overflow-auto custom-v-scrollbar data-[visible=true]:px-2"
      data-visible={!!!post.data?.post}
    >
      <Suspense
        fallback={
          <div class="m-auto h-full w-full flex-center">
            <Loading class="mx-auto text-4xl color-blue-5" />
          </div>
        }
      >
        <Skeleton.Root
          class="relative flex data-[visible=true]:min-h-50 w-full after:data-[visible=true]:(absolute rounded-xl content-empty inset-0 z-11 bg-dark-8 animate-[skeleton-fade_1500ms_linear_infinite]) before:data-[visible=true]:(absolute rounded-xl content-empty inset-0 z-10 bg-dark-2)"
          visible={!post.data?.post?.[0]}
        >
          <Show when={post.data?.post?.[0]}>
            {(postData) => (
              <PostRoot
                class="border-none bg-dark-8 max-sm:mx-2"
                {...postData()}
                downloaded={post.data?.persisted ?? false}
              />
            )}
          </Show>
        </Skeleton.Root>
      </Suspense>
      <Skeleton.Root
        class="relative flex flex-col oveflow-hidden h-full! data-[visible=true]:min-h-min flex-1 w-full after:data-[visible=true]:(absolute rounded-xl content-empty inset-0 z-11 bg-dark-8 animate-[skeleton-fade_1500ms_linear_infinite]) before:data-[visible=true]:(absolute rounded-xl content-empty inset-0 z-10 bg-dark-2)"
        visible={!post.data?.post}
      >
        <Show
          when={Object.keys(post.data?.post?.[1] ?? {}).length !== 0 && post.data?.post?.[1]}
          fallback={
            <div class="flex-center flex-col gap-4 w-full h-full color-neutral-5">
              <span class="color-orange-6">{'.·´¯`(>▂<)´¯`·.'}</span>
              No comments
            </div>
          }
        >
          {(comments) => (
            <CommentsProvider comments={comments()}>
              <For each={Object.values(comments()).filter((c) => c.mainCommentId === undefined)}>
                {(comment, i) => <CommentView {...comment} index={i()} depth={0} />}
              </For>
            </CommentsProvider>
          )}
        </Show>
      </Skeleton.Root>
    </div>
  );
};

export default Post;
