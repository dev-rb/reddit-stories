import { Button } from '@kobalte/core';

export default function Page404() {
  return (
    <div class="h-[80vh] flex-center flex-col gap-4 text-2xl color-white">
      <span class="color-red font-mono">404</span>
      <span class="color-red font-mono">Route does not exist</span>
      <span>{'.·´¯`(>▂<)´¯`·.'}</span>

      <a
        class="mt-4 cursor-pointer rounded-md bg-blue-6 px-6 py-3 text-base color-white decoration-none hover:bg-blue-7"
        href="/"
      >
        Go home
      </a>
    </div>
  );
}
