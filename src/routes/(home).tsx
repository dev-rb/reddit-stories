import { Button } from '@kobalte/core';
import { useSearchParams } from '@solidjs/router';
import { createQueries, createQuery, useQueryClient } from '@tanstack/solid-query';
import { ErrorBoundary, For, Index, Show, Suspense, createEffect, createSignal, untrack } from 'solid-js';
import { createStore, unwrap } from 'solid-js/store';
import { db } from '~/app';
import { Loading } from '~/components/Loading';
import { PostRoot } from '~/components/Post/PostRoot';
import { SortTabs } from '~/components/SortTabs';
import { KEBAB_SORT_VALUES } from '~/constants/sort';
import { Prompt } from '~/types';
import { getPersistedComments, getPosts } from '~/utils/data';
import { fetchCommentsForPost } from '~/utils/reddit';

const Home = () => {
  const [manualRefetch, setManualRefetch] = createSignal(false);
  const [downloading, setDownloading] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const [store, setStore] = createStore<Prompt[]>([]);

  const queryClient = useQueryClient();

  const sortParam = () => searchParams.sort ?? 'hot';

  const queryKey = () => ['posts', sortParam()];

  const posts = createQuery(() => ({
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
              return await fetchCommentsForPost(prompt.id);
            },
            initialData: async () => [prompt, await getPersistedComments(prompt.id)] as const,
          };
        }) ?? [],
    };
  });

  createEffect(() => {
    const data = posts.data;

    if (!data) return;

    setStore(data.prompts);
  });

  createEffect(() => {
    const fetched = posts.isFetched && !posts.isLoading && !posts.isRefetching && posts.status === 'success';
    const wasManual = untrack(manualRefetch);

    if (fetched && wasManual) {
      untrack(() => setManualRefetch(false));
    }
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
    setDownloading(true);
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
    setDownloading(false);
  };

  return (
    <SortTabs.Root
      class="overflow-hidden min-h-0 flex flex-col px-2 color-white"
      value={searchParams.sort}
      onChange={onTabChange}
    >
      <div class="overflow-hidden h-full flex flex-col gap-1">
        <SortTabs.TabsView
          root={{ class: 'overflow-visible bg-transparent p-0 justify-between' }}
          trigger={{ class: 'ui-selected:bg-dark-4 rounded-lg px-4 py-2 max-sm:p-2' }}
        />
        <div class="z-54 ml-auto flex items-center gap-4">
          <Button.Root
            class="flex-center cursor-pointer group appearance-none gap-2 rounded-full bg-transparent px-4 py-1 color-neutral-5 border-2 border-neutral-7 border-solid disabled:(bg-dark-8 cursor-not-allowed border-none color-neutral-6 hover:(color-neutral-6)) hover:(bg-neutral-9 color-neutral-2 border-neutral-6) max-sm:(px-2 text-xs)"
            data-fetching={manualRefetch()}
            disabled={manualRefetch() || downloading()}
            onClick={refresh}
          >
            <span class="i-material-symbols:refresh group-data-[fetching=true]:i-svg-spinners:180-ring inline-block text-lg max-sm:text-sm" />
          </Button.Root>

          <Button.Root
            class="group flex-center cursor-pointer appearance-none gap-2 rounded-full bg-transparent px-4 py-1 color-neutral-5 border-2 border-neutral-7 border-solid disabled:(bg-dark-8 cursor-not-allowed border-none color-neutral-6 hover:(color-neutral-6)) hover:(bg-neutral-9 color-neutral-2 border-neutral-6) max-sm:(px-2 text-xs)"
            disabled={posts.data?.persisted || store.every((v) => v.downloaded)}
            onClick={download}
            data-downloading={downloading()}
          >
            <span class="i-material-symbols:download group-data-[downloading=true]:i-svg-spinners:180-ring inline-block text-lg max-sm:text-sm" />
          </Button.Root>
        </div>
        <ErrorBoundary fallback={<div>Error</div>}>
          <div class="relative min-h-0 h-screen flex flex-col gap-1 overflow-hidden">
            <Suspense
              fallback={
                <div class="m-auto h-full w-full flex-center">
                  <Loading class="mx-auto text-4xl color-blue-5" />
                </div>
              }
            >
              <Show
                when={posts.data && !posts.isLoading && posts.status === 'success' && !posts.isRefetching}
                fallback={
                  <div class="h-full w-full flex-center">
                    <Loading class="mx-auto text-4xl color-blue-5" />
                  </div>
                }
              >
                <div class="absolute w-full h-full max-h-full top-0 left-0 bg-content-fade z-53 pointer-events-none" />
                <For each={KEBAB_SORT_VALUES}>
                  {(value) => (
                    <SortTabs.Content
                      class="relative custom-v-scrollbar h-full flex flex-col gap-2 overflow-auto pb-4 mt-2 pr-4 max-sm:pr-0 scroll-smooth"
                      value={value}
                    >
                      <Index each={store}>{(post) => <PostRoot {...post()} />}</Index>
                    </SortTabs.Content>
                  )}
                </For>
              </Show>
            </Suspense>
          </div>
        </ErrorBoundary>
      </div>
    </SortTabs.Root>
  );
};

export default Home;
