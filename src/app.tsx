// @refresh reload
import { Suspense, createSignal, onMount } from 'solid-js';
import './app.css';
import 'uno.css';
import { AppHeader } from './components/AppHeader';
import { A, Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start';
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query';
import { PersistedClient, Persister, persistQueryClientRestore } from '@tanstack/solid-query-persist-client';
import { set, get, del } from 'idb-keyval';

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
function createIDBPersister(idbValidKey: string = 'reactQuery') {
  return {
    persistClient: async (client: PersistedClient) => {
      await set(idbValidKey, client);
    },
    restoreClient: async () => {
      return await get<PersistedClient>(idbValidKey);
    },
    removeClient: async () => {
      await del(idbValidKey);
    },
  } as Persister;
}

export const persister = createIDBPersister();

export default function App() {
  onMount(() => {
    persistQueryClientRestore({ queryClient, persister });
    // console.log(queryClient.getQueryData({ queryKey: ['posts'] }));
  });
  return (
    <Router
      root={(props) => (
        <Suspense>
          <main class="relative mx-auto max-h-screen max-w-2xl min-h-screen flex flex-col gap-4 bg-dark-9">
            <QueryClientProvider client={queryClient}>
              <AppHeader />

              {props.children}
            </QueryClientProvider>

            <nav class="mt-auto w-full flex items-center justify-evenly bg-dark-9 px-4 py-2">
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
        </Suspense>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
