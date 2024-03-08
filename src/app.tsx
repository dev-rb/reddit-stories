// @refresh reload
import { onMount } from 'solid-js';
import './app.css';
import 'uno.css';
import { AppHeader } from './components/AppHeader';
import { Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { StoreDefinition, createDB } from './utils/db';
import { checkForDarkPreference } from './utils/theme';

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
    if (checkForDarkPreference()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    db = await createDB('tavern-tales', [PostDBStore, CommentDBStore]);
  });

  return (
    <Router
      root={(props) => (
        <main class="relative mx-auto max-h-screen min-h-screen overflow-y-hidden overflow-x-visible flex flex-col max-w-2xl dark:bg-dark-9">
          <QueryClientProvider client={queryClient}>
            <AppHeader />

            {props.children}
          </QueryClientProvider>
        </main>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
