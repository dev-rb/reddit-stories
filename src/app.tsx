// @refresh reload
import { createSignal } from 'solid-js';
import './app.css';
import 'uno.css';
import { AppHeader } from './components/AppHeader';
import { SortTabs } from './components/SortTabs';
import { ClientOnly } from './components/ClientOnly';

export default function App() {
  return (
    <main class="mx-auto max-w-2xl min-h-screen bg-dark-950 p-4">
      <AppHeader />

      <SortTabs.Root class="color-white">
        <SortTabs.TabsView />
        <SortTabs.Content value="hot">Hot Content</SortTabs.Content>
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
