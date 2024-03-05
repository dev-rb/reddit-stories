import { defineConfig } from '@solidjs/start/config';
import uno from 'unocss/vite';

export default defineConfig({
  vite: {
    plugins: [
      // @ts-ignore
      uno(),
    ],
  },
  ssr: false,
  server: {
    preset: 'vercel',
  },
});
