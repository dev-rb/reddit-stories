// @refresh reload
import { Suspense, onMount } from 'solid-js';
import './app.css';
import 'uno.css';
import { AppHeader } from './components/AppHeader';
import { A, Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { StoreDefinition, createDB, noopDb } from './utils/db';
import { isServer } from 'solid-js/web';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchIntervalInBackground: false,
      gcTime: Infinity,
      retryOnMount: false,
      refetchOnMount: false,
      retryDelay: Infinity,
      staleTime: Infinity,
      refetchInterval: Infinity,
    },
  },
});

const PostDBStore: StoreDefinition = {
  name: 'posts',
  key: 'id',
  index: { name: 'sortIndex', key: 'sort' },
};
const CommentDBStore: StoreDefinition = {
  name: 'comments',
  key: 'id',
  index: { name: 'commentsIndex', key: 'postId' },
};

export let db: Awaited<ReturnType<typeof createDB>>;

export default function App() {
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js');
  }
  onMount(async () => {
    db = await createDB('tavern-tales', [PostDBStore, CommentDBStore]);
  });
  return (
    <Router
      root={(props) => (
        <main class="relative mx-auto max-h-screen min-h-screen overflow-y-hidden overflow-x-visible flex flex-col max-w-2xl bg-dark-9">
          <QueryClientProvider client={queryClient}>
            <AppHeader />

            {props.children}
          </QueryClientProvider>

          <nav class="mt-auto w-full flex items-center justify-evenly px-4 py-2">
            <A
              class="bg-transparent text-4xl max-sm:text-sm"
              inactiveClass="color-neutral-6"
              activeClass="color-white"
              href="/"
              end
            >
              <span class="i-material-symbols:home inline-block" />
            </A>
            <A
              class="bg-transparent text-4xl max-sm:text-sm"
              inactiveClass="color-neutral-6"
              activeClass="color-white"
              href="/search"
            >
              <span class="i-material-symbols:search inline-block" />
            </A>
            <A
              class="bg-transparent text-3xl max-sm:text-sm"
              inactiveClass="color-neutral-6"
              activeClass="color-white"
              href="/town-hall"
            >
              <span class="i-material-symbols:view-agenda-outline inline-block" />
            </A>
            <A
              class="bg-transparent text-3xl max-sm:text-sm"
              inactiveClass="color-neutral-6"
              activeClass="color-white"
              href="/read-later"
            >
              <span class="i-material-symbols:alarm-outline inline-block" />
            </A>
            <A
              class="bg-transparent text-3xl max-sm:text-sm"
              inactiveClass="color-neutral-6"
              activeClass="color-white"
              href="/account"
            >
              <span class="i-material-symbols:person-outline inline-block" />
            </A>
          </nav>
        </main>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
