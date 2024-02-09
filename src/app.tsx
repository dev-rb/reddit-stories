// @refresh reload
import { createSignal } from 'solid-js';
import './app.css';
import 'uno.css';
import { AppHeader } from './components/AppHeader';
import { SortTabs } from './components/SortTabs';
import { ClientOnly } from './components/ClientOnly';
import { Button } from '@kobalte/core';
import { PostRoot } from './components/Post/PostRoot';

export default function App() {
  return (
    <main class="mx-auto max-w-2xl min-h-screen flex flex-col gap-4 bg-dark-950">
      <AppHeader />

      <SortTabs.Root class="flex flex-col gap-4 color-white">
        <div class="flex flex-col gap-4 px-4">
          <SortTabs.TabsView />
          <div class="ml-auto flex items-center gap-4">
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
        <SortTabs.Content value="hot">
          <PostRoot></PostRoot>
        </SortTabs.Content>
        <SortTabs.Content value="new">New Content</SortTabs.Content>
        <SortTabs.Content value="top-today">Top Today Content</SortTabs.Content>
        <SortTabs.Content value="top-week">Top Week Content</SortTabs.Content>
        <SortTabs.Content value="top-month">Top Month Content</SortTabs.Content>
        <SortTabs.Content value="top-year">Top Year Content</SortTabs.Content>
        <SortTabs.Content value="top-all">Top All Content</SortTabs.Content>
      </SortTabs.Root>
    </main>
  );
}
