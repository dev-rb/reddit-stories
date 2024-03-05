import { Button, ToggleButton } from '@kobalte/core';
import { A, useMatch } from '@solidjs/router';
import { Show, mergeProps, splitProps } from 'solid-js';
import { OverrideComponentProps } from '~/types';
import { Prompt } from '~/types/app';
import { cn } from '~/utils/common';
import dayjs from '~/utils/dayjs';

interface PostRootProps extends Omit<OverrideComponentProps<typeof A, Prompt>, 'href'> {
  sort?: string;
}

export const PostRoot = (props: PostRootProps) => {
  props = mergeProps({ downloaded: false }, props);

  const isPostRoute = useMatch(() => '/post/*');
  const [self, other] = splitProps(props, [
    'downloaded',
    'description',
    'created',
    'id',
    'title',
    'score',
    'author',
    'permalink',
    'totalComments',
    'stories',
    'class',
    'sort',
  ]);

  return (
    <A
      class={cn(
        'relative w-full flex flex-col gap-2 border-2 border-neutral-3 dark:border-dark-4 rounded-xl border-solid px-4 py-2 decoration-none',
        self.class
      )}
      {...other}
      href={`post/${self.id}`}
      noScroll={true}
    >
      <div class="relative flex items-center gap-2 text-xxs color-neutral-4 dark:color-neutral-5 font-sans">
        {/* <span>{props.id}</span> */}
        <span>u/{self.author}</span>
        <span>{dayjs(self.created).fromNow()}</span>
        <ToggleButton.Root
          as="div"
          class="ml-auto aspect-square flex-center rounded-full bg-transparent color-neutral-5 dark:color-neutral-6 ui-pressed:(color-blue-5)"
          pressed={self.downloaded}
        >
          <span class="i-material-symbols:download inline-block text-base" />
        </ToggleButton.Root>
      </div>
      <div class="flex flex-col gap-4 max-sm:gap-2">
        <div class="text-xs max-sm:text-xxs color-neutral-7 dark:color-neutral-3">{self.title}</div>
        <Show when={isPostRoute() && props.description}>
          <div
            class="text-xs max-sm:text-xxs color-neutral-7 dark:color-neutral-3 border-t-1 border-t-solid border-t-neutral-6 pt-2 [&_a]:color-blue-4 max-w-full [&_*]:(break-words whitespace-normal leading-[1.5])"
            innerHTML={props.description}
          />
        </Show>
        <PostInteractions totalComments={self.totalComments ?? 0} score={self.score ?? 0} />
      </div>
    </A>
  );
};

interface PostInteractionsProps extends Pick<Prompt, 'score' | 'totalComments'> {}

export const PostInteractions = (props: PostInteractionsProps) => {
  return (
    <div class="flex items-center gap-4">
      <ToggleButton.Root class="group flex-center cursor-pointer select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-4 dark:color-neutral-5 ui-pressed:color-white">
        <span class="i-material-symbols-favorite-outline ui-pressed:i-material-symbols-favorite-rounded inline-block text-lg ui-pressed:(color-blue-3)" />
        {props.score}
      </ToggleButton.Root>
      <Button.Root class="group flex-center cursor-pointer select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-4 dark:color-neutral-5 ui-pressed:color-white">
        <span class="i-material-symbols:mode-comment-outline text-lg" />
        {props.totalComments}
      </Button.Root>

      {/* <ToggleButton.Root class="group flex-center select-none appearance-none gap-1 bg-transparent text-0.7rem color-neutral-5 ui-pressed:color-white"> */}
      {/*   <span class="i-material-symbols-bookmark-outline ui-pressed:i-material-symbols-bookmark inline-block cursor-pointer text-lg ui-pressed:(color-blue-3)" /> */}
      {/*   Save */}
      {/* </ToggleButton.Root> */}
    </div>
  );
};
