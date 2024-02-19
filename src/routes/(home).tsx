import { Button } from '@kobalte/core';
import { useSearchParams } from '@solidjs/router';
import { createQueries, createQuery, dehydrate, useQueryClient } from '@tanstack/solid-query';
import { PersistedClient } from '@tanstack/solid-query-persist-client';
import { For, Show, Suspense, createEffect, createSignal, onMount, untrack } from 'solid-js';
import { unwrap } from 'solid-js/store';
import { persister } from '~/app';
import { ClientOnly } from '~/components/ClientOnly';
import { Loading } from '~/components/Loading';
import { PostRoot } from '~/components/Post/PostRoot';
import { SortTabs } from '~/components/SortTabs';
import { KEBAB_SORT_VALUES } from '~/constants/sort';
import { Prompt } from '~/types';
import { Posts } from '~/types/reddit';
import { extractPostDetails, fetchCommentsForPost, Comments } from '~/utils/reddit';

const getPosts = async (sort: string) => {
  const sortType = sort.includes('top') ? 'top' : sort;
  const timeSort = sort.includes('top') ? `t=${sort.split('-')[1]}&` : '';
  const count = 100;

  const persisted = await persister.get(`posts.${sort}`)?.then((d) => {
    return d;
  });
  console.log(persisted);

  if (persisted) {
    return { prompts: persisted as Prompt[], persisted: true };
  }

  const postsData: Posts = await (
    await fetch(`https://www.reddit.com/r/writingprompts/${sortType}.json?${timeSort}limit=${count}&raw_json=1`)
  ).json();

  console.log('Fetch data');
  const prompts = postsData.data?.children.map(extractPostDetails);

  return { prompts: prompts, persisted: false };
};

const Home = () => {
  const [mounted, setMounted] = createSignal(false);
  const [manualRefetch, setManualRefetch] = createSignal(false);
  const [searchParams, setSearchParams] = useSearchParams();

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
              return [prompt.id, await fetchCommentsForPost('/r/writingprompts', prompt.id)];
            },
            // initialData: async () => {
            //   const data = await persister.get(`comments.${prompt.id}`);
            //   return (data ?? []) as [string, Comments];
            // },
          };
        }) ?? [],
    };
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

  const refresh = async () => {
    setManualRefetch(true);
    persister.remove(`posts.${sortParam()}`);
    for (const c of await persister.getAll()) {
      const k = c[0].toString();
      if (k.includes('comments')) {
        persister.remove(k);
      }
    }
    queryClient.invalidateQueries({
      refetchType: 'all',
      type: 'all',
    });
  };

  const download = async () => {
    const data = posts.data?.prompts;

    if (!data || !data.length) return;

    for (const commentQuery of comments) {
      const postComments = await commentQuery.refetch();
      if (!postComments.data) continue;
      const prompt = (await postComments.data)[0];
      await persister.save(`comments.${prompt}`, unwrap(postComments.data));
    }

    await persister.save(`posts.${sortParam()}`, unwrap(data));
    await posts.refetch();
  };

  const isDownloaded = (id: string) => {
    const v = comments.find(async (c) => {
      const map = await c.data;
      if (!map || !map.length) return false;
      setTimeout(() => {}, 2000);
      return map[0] === id;
    });
    return !!v && v.isFetched;
  };

  return (
    <SortTabs.Root
      class="overflow-hidden min-h-0 flex flex-col px-4 color-white"
      value={searchParams.sort}
      onChange={onTabChange}
    >
      <div class="overflow-hidden h-full flex flex-col gap-4">
        <SortTabs.TabsView />
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
                disabled={posts.data?.persisted}
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
                    <For each={posts.data?.prompts}>
                      {(post) => <PostRoot {...post} downloaded={isDownloaded(post.id)} />}
                    </For>
                  </SortTabs.Content>
                )}
              </For>
            </Show>
          </div>
        </Suspense>
      </div>
    </SortTabs.Root>
  );
};

export default Home;
