// @refresh reload
import { Suspense, createSignal } from 'solid-js';
import './app.css';
import 'uno.css';
import { AppHeader } from './components/AppHeader';
import { A, Router } from '@solidjs/router';
import { FileRoutes } from '@solidjs/start';

export default function App() {
  return (
    <Router
      root={(props) => (
        <Suspense>
          <main class="relative mx-auto max-h-screen max-w-2xl min-h-screen flex flex-col gap-4 bg-dark-9">
            <AppHeader />

            {props.children}

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
