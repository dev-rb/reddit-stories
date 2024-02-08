// @refresh reload
import { createSignal } from 'solid-js';
import './app.css';
import 'uno.css';
import { AppHeader } from './components/AppHeader';
import { SortNav } from './components/SortNav';
import { ClientOnly } from './components/ClientOnly';

export default function App() {
  return (
    <main class="mx-auto max-w-2xl min-h-screen bg-dark-950 p-4">
      <AppHeader />

      <SortNav />
    </main>
  );
}
