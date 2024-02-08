import { defineConfig } from '@solidjs/start/config';
import uno from 'unocss/vite';

export default defineConfig({
  plugins: [
    // @ts-ignore
    uno(),
  ],
});
