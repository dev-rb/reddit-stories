import { Button } from '@kobalte/core';
import { createAsync, useSearchParams } from '@solidjs/router';
import { createQuery, dehydrate, useQueryClient } from '@tanstack/solid-query';
import {
  PersistedClient,
  Persister,
  persistQueryClient,
  persistQueryClientRestore,
  persistQueryClientSave,
} from '@tanstack/solid-query-persist-client';
import { For, Show, Suspense, createEffect, createSignal, onMount, untrack } from 'solid-js';
import { persister } from '~/app';
import { ClientOnly } from '~/components/ClientOnly';
import { Loading } from '~/components/Loading';
import { PostRoot } from '~/components/Post/PostRoot';
import { SortTabs } from '~/components/SortTabs';
import { KEBAB_SORT_VALUES } from '~/constants/sort';
import { Posts } from '~/types/reddit';
import { extractPostDetails } from '~/utils/reddit';

const getPosts = async (sort: string) => {
  const sortType = sort.includes('top') ? 'top' : sort;
  const timeSort = sort.includes('top') ? `t=${sort.split('-')[1]}&` : '';
  const count = 100;

  const persisted = await persister.restoreClient()?.then((d: PersistedClient) => {
    return d.clientState.queries.find((q) => q.queryKey.includes(sort))?.state.data;
  });

  if (persisted) {
    return persisted;
  }

  const postsData: Posts = await (
    await fetch(`https://www.reddit.com/r/writingprompts/${sortType}.json?${timeSort}limit=${count}&raw_json=1`)
  ).json();

  console.log('Fetch data');
  return postsData.data?.children.map(extractPostDetails);
};

const Home = () => {
  const [mounted, setMounted] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();
  setSearchParams({ sort: 'hot' });

  const queryClient = useQueryClient();

  const sortParam = () => searchParams.sort ?? 'hot';

  const queryKey = () => ['posts', sortParam()];

  const posts = createQuery(() => ({
    enabled: mounted(),
    queryKey: queryKey(),
    queryFn: ({ queryKey }) => {
      return getPosts(queryKey[1]);
    },
  }));

  onMount(() => {
    setMounted(true);
  });

  const onTabChange = (newTab: string) => {
    setSearchParams({ sort: newTab });
  };

  const download = () => {
    const client: PersistedClient = { clientState: dehydrate(queryClient), buster: '', timestamp: Date.now() };
    persister.persistClient(client);
  };

  return (
    <SortTabs.Root
      class="h-screen flex flex-col gap-2 overflow-hidden px-4 color-white"
      value={searchParams.sort}
      onChange={onTabChange}
    >
      <div class="flex flex-col gap-4">
        <SortTabs.TabsView />
        <div class="mb-2 ml-auto flex items-center gap-4">
          <Button.Root
            class="flex-center cursor-pointer appearance-none gap-2 rounded-full bg-transparent px-4 py-1 color-neutral-5 outline-2 outline-neutral-7 outline hover:(bg-neutral-9 color-neutral-2 outline-neutral-4) max-sm:(px-2 text-xs)"
            onClick={() => {
              queryClient.invalidateQueries({
                queryKey: queryKey(),
                refetchType: 'all',
                type: 'all',
              });
            }}
          >
            Refresh
            <span class="i-material-symbols:refresh inline-block text-lg max-sm:text-sm" />
          </Button.Root>

          <Button.Root
            class="flex-center cursor-pointer appearance-none gap-2 rounded-full bg-transparent px-4 py-1 color-neutral-5 outline-2 outline-neutral-7 outline hover:(bg-neutral-9 color-neutral-2 outline-neutral-4) max-sm:(px-2 text-xs)"
            onClick={download}
          >
            Download All
            <span class="i-material-symbols:download inline-block text-lg max-sm:text-sm" />
          </Button.Root>
        </div>
      </div>

      <Suspense
        fallback={
          <div class="h-full w-full flex-center">
            <Loading class="mx-auto text-4xl color-blue-2" />
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
          <For each={KEBAB_SORT_VALUES}>
            {(value) => (
              <SortTabs.Content
                class="custom-v-scrollbar h-full min-h-0 flex flex-col gap-4 overflow-auto pr-4"
                value={value}
              >
                <For each={posts.data}>{(post) => <PostRoot {...post} />}</For>
              </SortTabs.Content>
            )}
          </For>
        </Show>
      </Suspense>
    </SortTabs.Root>
  );
};

export default Home;
