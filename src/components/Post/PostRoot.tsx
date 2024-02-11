import { Button, ToggleButton } from '@kobalte/core';
import { Post } from '~/types/reddit';

interface PostRootProps extends Post {}

export const PostRoot = (props: PostRootProps) => {
  return (
    <div class="relative w-full flex flex-col gap-2 border-2 border-dark-4 rounded-xl border-solid px-4 py-2">
      <ToggleButton.Root class="absolute right-2 top-2 ml-auto aspect-square flex-center rounded-full bg-neutral-7 p-1 color-neutral-4 ui-pressed:(bg-blue-950 color-blue-4)">
        <span class="i-material-symbols:download inline-block text-base" />
      </ToggleButton.Root>
      <div class="flex items-center gap-2 text-0.7rem color-neutral-5 font-sans">
        <span>u/author-name</span>
        <span>February 9th, 2024</span>
      </div>
      <div class="flex flex-col gap-4">
        <div class="text-xs color-neutral-3">
          You are out with a friend when suddenly you blink and everything around you looks ruined and everyone looks
          like statues. A frail old man looks at you and weeps while he says “After 84 years, I finally was able to wake
          someone up”
        </div>
        <PostInteractions />
      </div>
    </div>
  );
};

export const PostInteractions = () => {
  return (
    <div class="flex items-center gap-4">
      <ToggleButton.Root class="group flex-center cursor-pointer select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-5 ui-pressed:color-white">
        <span class="i-material-symbols-favorite-outline ui-pressed:i-material-symbols-favorite-rounded inline-block text-lg ui-pressed:(color-blue-3)" />
        1.1k
      </ToggleButton.Root>
      <Button.Root class="group flex-center cursor-pointer select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-5 ui-pressed:color-white">
        <span class="i-material-symbols:mode-comment-outline text-lg" />
        200
      </Button.Root>

      <ToggleButton.Root class="group flex-center select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-5 ui-pressed:color-white">
        <span class="i-material-symbols-bookmark-outline ui-pressed:i-material-symbols-bookmark inline-block cursor-pointer text-lg ui-pressed:(color-blue-3)" />
        Save
      </ToggleButton.Root>
    </div>
  );
};
