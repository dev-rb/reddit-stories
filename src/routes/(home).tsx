import { Button } from '@kobalte/core';
import { useSearchParams } from '@solidjs/router';
import { createQueries, createQuery, useQueryClient } from '@tanstack/solid-query';
import { ErrorBoundary, For, Index, Show, Suspense, createEffect, createSignal, onMount, untrack } from 'solid-js';
import { createStore, reconcile, unwrap } from 'solid-js/store';
import { db } from '~/app';
import { Loading } from '~/components/Loading';
import { PostRoot } from '~/components/Post/PostRoot';
import { SortTabs } from '~/components/SortTabs';
import { KEBAB_SORT_VALUES } from '~/constants/sort';
import { Comment, Prompt } from '~/types';
import { getPosts } from '~/utils/data';
import { fetchCommentsForPost, Comments } from '~/utils/reddit';

const Home = () => {
  const [mounted, setMounted] = createSignal(false);
  const [manualRefetch, setManualRefetch] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [store, setStore] = createStore<Prompt[]>([]);

  const queryClient = useQueryClient();

  const sortParam = () => searchParams.sort ?? 'hot';

  const queryKey = () => ['posts', sortParam()];

  const posts = createQuery(() => ({
    enabled: mounted(),
    queryKey: queryKey(),
    queryFn: async ({ queryKey }) => {
      return await getPosts(queryKey[1]);
    },
    initialData: () => {
      const prompts: Prompt[] | undefined = queryClient.getQueryData(queryKey());

      if (!prompts) return;

      return { prompts, persisted: true };
    },
  }));

  const comments = createQueries(() => {
    return {
      queries:
        posts.data?.prompts?.map((prompt) => {
          return {
            enabled: false,
            queryKey: ['comments', prompt.id],
            queryFn: async () => {
              return await fetchCommentsForPost('/r/writingprompts', prompt.id);
            },
            initialData: async () => {
              const id = prompt.id;
              const post = unwrap(prompt);
              const data = await db.raw(async (db) => {
                const tx = db.transaction('comments', 'readonly');

                const index = tx.store.index('commentsIndex');
                let cursor = await index.openKeyCursor(id);

                let results: Comments = {};

                while (cursor) {
                  const comment: Comment = await tx.store.get(cursor.primaryKey);
                  results[comment.id] = comment;
                  cursor = await cursor.continue();
                }
                return results;
              });

              return [post, data] as const;
            },
          };
        }) ?? [],
    };
  });

  createEffect(() => {
    const data = posts.data;

    if (!data) return;

    setStore(reconcile(data.prompts));
  });

  createEffect(() => {
    const fetched = posts.isFetched && !posts.isLoading && !posts.isRefetching && posts.status === 'success';
    const wasManual = untrack(manualRefetch);

    if (fetched && wasManual) {
      untrack(() => setManualRefetch(false));
    }
  });

  onMount(() => {
    setMounted(true);
  });

  const onTabChange = (newTab: string) => {
    setSearchParams({ sort: newTab });
  };

  const deleteFromDb = () => {
    db.raw(async (db) => {
      const tx = db.transaction(['posts', 'comments'], 'readwrite');

      let postsCursor = await tx.objectStore('posts').openCursor();
      const commentsStore = tx.objectStore('comments');
      const commentsIndex = commentsStore.index('commentsIndex');

      while (postsCursor) {
        if (postsCursor.value.sort === sortParam()) {
          let commentsCursor = await commentsIndex.openKeyCursor(postsCursor.value.id);

          while (commentsCursor) {
            commentsStore.delete(commentsCursor.primaryKey);
            commentsCursor = await commentsCursor.continue();
          }

          postsCursor.delete();
        }

        postsCursor = await postsCursor.continue();
      }
    });
  };

  const refresh = async () => {
    setManualRefetch(true);
    deleteFromDb();

    queryClient.invalidateQueries({
      refetchType: 'all',
      type: 'all',
    });
  };

  const download = async () => {
    const data = posts.data?.prompts;

    if (!data || !data.length) return;

    const unwrappedPosts = unwrap(data);

    let promises: Promise<any>[] = [];

    for (const commentQuery of comments) {
      const postComments = commentQuery.refetch();

      const promise = postComments.then(async (value) => {
        try {
          const data = await value.data;
          if (!data) return;

          const unwrapped = unwrap(data);

          const prompt = unwrapped[0];
          const comments = unwrapped[1];

          await db.upsertMany(`comments`, Object.entries(comments));
          setStore((p) => p.id === prompt.id, 'downloaded', true);
        } catch (e) {
          console.log('Error: ', e);
        }
      });

      promises.push(promise);
    }

    await Promise.all(promises);

    await db.upsertMany(
      `posts`,
      unwrappedPosts.reduce(
        (acc, curr) => {
          acc.push([curr.id, { ...curr, sort: sortParam() }]);

          return acc;
        },
        [] as unknown as [string, Prompt & { sort: string }][]
      )
    );
  };

  return (
    <SortTabs.Root
      class="overflow-hidden min-h-0 flex flex-col px-4 color-white"
      value={searchParams.sort}
      onChange={onTabChange}
    >
      <div class="overflow-hidden h-full flex flex-col gap-4">
        <SortTabs.TabsView />
        <ErrorBoundary fallback={<div>Error</div>}>
          <Suspense
            fallback={
              <div class="m-auto h-full w-full flex-center">
                <Loading class="mx-auto text-4xl color-blue-5" />
              </div>
            }
          >
            <div class="relative min-h-0 h-screen flex flex-col gap-2 overflow-hidden after:(absolute bottom-0 left-0 w-full from-dark-9 to-75% bg-gradient-to-t py-4 content-empty) before:(absolute left-0 top-10 z-10 w-full from-dark-9 from-45% bg-gradient-to-b py-4 content-empty)">
              <div class="ml-auto mt-2 flex items-center gap-4 pr-1">
                <Button.Root
                  class="flex-center cursor-pointer group appearance-none gap-2 rounded-full bg-transparent px-4 py-1 color-neutral-5 outline-2 outline-neutral-7 outline disabled:(bg-dark-8 cursor-not-allowed outline-none color-neutral-6 hover:(color-neutral-6)) hover:(bg-neutral-9 color-neutral-2 outline-neutral-4) max-sm:(px-2 text-xs)"
                  disabled={manualRefetch()}
                  onClick={refresh}
                >
                  Refresh
                  <span class="i-material-symbols:refresh group-disabled:i-svg-spinners:180-ring inline-block text-lg max-sm:text-sm" />
                </Button.Root>

                <Button.Root
                  class="flex-center cursor-pointer appearance-none gap-2 rounded-full bg-transparent px-4 py-1 color-neutral-5 outline-2 outline-neutral-7 outline disabled:(bg-dark-8 cursor-not-allowed outline-none color-neutral-6 hover:(color-neutral-6)) hover:(bg-neutral-9 color-neutral-2 outline-neutral-4) max-sm:(px-2 text-xs)"
                  disabled={posts.data?.persisted || store.every((v) => v.downloaded)}
                  onClick={download}
                >
                  Download All
                  <span class="i-material-symbols:download inline-block text-lg max-sm:text-sm" />
                </Button.Root>
              </div>
              <Show
                when={posts.data && !posts.isLoading && posts.status === 'success' && !posts.isRefetching}
                fallback={
                  <div class="h-full w-full flex-center">
                    <Loading class="mx-auto text-4xl color-blue-5" />
                  </div>
                }
              >
                <For each={KEBAB_SORT_VALUES}>
                  {(value) => (
                    <SortTabs.Content
                      class="custom-v-scrollbar h-full flex flex-col gap-4 overflow-auto py-4 pr-4 "
                      value={value}
                    >
                      <Index each={store}>{(post) => <PostRoot {...post()} />}</Index>
                    </SortTabs.Content>
                  )}
                </For>
              </Show>
            </div>
          </Suspense>
        </ErrorBoundary>
      </div>
    </SortTabs.Root>
  );
};

export default Home;
