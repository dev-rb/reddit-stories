import { Button, ToggleButton } from '@kobalte/core';
import { A } from '@solidjs/router';
import { mergeProps } from 'solid-js';
import { Prompt } from '~/types/app';

interface PostRootProps extends Prompt {}

export const PostRoot = (props: PostRootProps) => {
  props = mergeProps({ downloaded: false }, props);

  return (
    <A
      class="relative w-full flex flex-col gap-2 border-2 border-dark-4 rounded-xl border-solid px-4 py-2 decoration-none"
      href={`post/${props.id}`}
    >
      <ToggleButton.Root
        class="absolute right-2 top-2 ml-auto aspect-square flex-center rounded-full bg-neutral-7 p-1 color-neutral-4 ui-pressed:(bg-blue-950 color-blue-4)"
        pressed={props.downloaded}
      >
        <span class="i-material-symbols:download inline-block text-base" />
      </ToggleButton.Root>
      <div class="flex items-center gap-2 text-0.7rem color-neutral-5 font-sans">
        <span>{props.id}</span>
        <span>u/{props.author}</span>
        <span>{props.created}</span>
      </div>
      <div class="flex flex-col gap-4">
        <div class="pr-8 text-xs color-neutral-3">{props.title}</div>
        <PostInteractions totalComments={props.totalComments ?? 0} score={props.score ?? 0} />
      </div>
    </A>
  );
};

interface PostInteractionsProps extends Pick<Prompt, 'score' | 'totalComments'> {}

export const PostInteractions = (props: PostInteractionsProps) => {
  return (
    <div class="flex items-center gap-4">
      <ToggleButton.Root class="group flex-center cursor-pointer select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-5 ui-pressed:color-white">
        <span class="i-material-symbols-favorite-outline ui-pressed:i-material-symbols-favorite-rounded inline-block text-lg ui-pressed:(color-blue-3)" />
        {props.score}
      </ToggleButton.Root>
      <Button.Root class="group flex-center cursor-pointer select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-5 ui-pressed:color-white">
        <span class="i-material-symbols:mode-comment-outline text-lg" />
        {props.totalComments}
      </Button.Root>

      <ToggleButton.Root class="group flex-center select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-5 ui-pressed:color-white">
        <span class="i-material-symbols-bookmark-outline ui-pressed:i-material-symbols-bookmark inline-block cursor-pointer text-lg ui-pressed:(color-blue-3)" />
        Save
      </ToggleButton.Root>
    </div>
  );
};
