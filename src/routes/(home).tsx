import { Button } from '@kobalte/core';
import { useSearchParams } from '@solidjs/router';
import { createQueries, createQuery, useQueryClient } from '@tanstack/solid-query';
import { For, Show, Suspense, createEffect, createSignal, onMount, untrack } from 'solid-js';
import { unwrap } from 'solid-js/store';
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

    for (const commentQuery of comments) {
      const postComments = await commentQuery.refetch();
      if (!postComments.data) continue;
      const prompt = (await postComments.data)[0];
      const unwrapped = unwrap(postComments.data);
      await db.upsertMany(
        `comments`,
        Object.values(unwrapped[1] as Comments).reduce(
          (acc, curr) => {
            if (typeof curr === 'string') return acc;

            acc.push([curr.id, curr]);

            return acc;
          },
          [] as unknown as [string, Comment][]
        )
      );
    }

    const unwrappedPosts = unwrap(data);
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
