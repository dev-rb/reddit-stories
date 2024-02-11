import { Button } from '@kobalte/core';
import { useSearchParams } from '@solidjs/router';
import { PostRoot } from '~/components/Post/PostRoot';
import { SortTabs } from '~/components/SortTabs';

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  setSearchParams({ sort: 'hot' });

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
        <SortTabs.Content
          class="custom-v-scrollbar h-full min-h-0 flex flex-col gap-4 overflow-auto pr-4"
          // forceMount
          value="hot"
        >
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
          <PostRoot></PostRoot>
        </SortTabs.Content>
        <SortTabs.Content value="new">New Content</SortTabs.Content>
        <SortTabs.Content value="top-today">Top Today Content</SortTabs.Content>
        <SortTabs.Content value="top-week">Top Week Content</SortTabs.Content>
        <SortTabs.Content value="top-month">Top Month Content</SortTabs.Content>
        <SortTabs.Content value="top-year">Top Year Content</SortTabs.Content>
        <SortTabs.Content value="top-all">Top All Content</SortTabs.Content>
      </SortTabs.Root>
    </>
  );
};

export default Home;
