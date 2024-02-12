import { Button } from '@kobalte/core';
import { cache, createAsync, useSearchParams } from '@solidjs/router';
import { For, Show, Suspense, createEffect } from 'solid-js';
import { PostRoot } from '~/components/Post/PostRoot';
import { SortTabs } from '~/components/SortTabs';
import { KEBAB_SORT_VALUES } from '~/constants/sort';
import { Posts } from '~/types/reddit';
import { extractPostDetails } from '~/utils/reddit';

const getPosts = async (sort: string) => {
  const sortType = sort.includes('top') ? 'top' : sort;
  const timeSort = sort.includes('top') ? `t=${sort.split('-')[1]}` : '';

  const singleData: Posts = await (
    await fetch(`https://www.reddit.com/r/writingprompts/${sortType}.json?${timeSort + '&'}limit=${100}&raw_json=1`)
  ).json();

  return singleData.data?.children.map(extractPostDetails);
};

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  setSearchParams({ sort: 'hot' });

  const posts = createAsync(() => getPosts(searchParams.sort ?? 'hot'));

  const onTabChange = (newTab: string) => {
    setSearchParams({ sort: newTab });
  };

  return (
    <>
      <SortTabs.Root
        class="h-full min-h-min flex flex-col gap-2 overflow-hidden px-4 color-white"
        value={searchParams.sort}
        onChange={onTabChange}
      >
        <div class="flex flex-col gap-4">
          <SortTabs.TabsView />
          <div class="mb-2 ml-auto flex items-center gap-4">
            <Button.Root class="flex-center cursor-pointer appearance-none gap-2 rounded-full bg-transparent px-4 py-1 color-neutral-5 outline-2 outline-neutral-7 outline hover:(bg-neutral-9 color-neutral-2 outline-neutral-4) max-sm:(px-2 text-xs)">
              Refresh
              <span class="i-material-symbols:refresh inline-block text-lg max-sm:text-sm" />
            </Button.Root>

            <Button.Root class="flex-center cursor-pointer appearance-none gap-2 rounded-full bg-transparent px-4 py-1 color-neutral-5 outline-2 outline-neutral-7 outline hover:(bg-neutral-9 color-neutral-2 outline-neutral-4) max-sm:(px-2 text-xs)">
              Download All
              <span class="i-material-symbols:download inline-block text-lg max-sm:text-sm" />
            </Button.Root>
          </div>
        </div>

        <For each={KEBAB_SORT_VALUES}>
          {(value) => (
            <SortTabs.Content
              class="custom-v-scrollbar h-full min-h-0 flex flex-col gap-4 overflow-auto pr-4"
              value={value}
            >
              <For each={posts()}>{(post) => <PostRoot {...post} />}</For>
            </SortTabs.Content>
          )}
        </For>
      </SortTabs.Root>
    </>
  );
};

export default Home;
