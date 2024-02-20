import { Comment } from '~/types';
import { useComments } from '../CommentsContext';
import { ToggleButton } from '@kobalte/core';
import { PostInteractions } from '../Post/PostRoot';
import { For } from 'solid-js';
import { cn } from '~/utils/common';

export const nestedColors: string[] = [
  'blue',
  'green',
  'red',
  'indigo',
  'orange',
  'pink',
  'cyan',
  'yellow',
  'cyan',
  'lime',
  'violet',
];

interface CommentViewProps extends Comment {
  depth: number;
}

export const CommentView = (props: CommentViewProps) => {
  const comments = useComments();

  return (
    <div class="flex flex-col gap-2">
      <div
        class={cn(
          'relative max-w-full flex flex-col gap-2 before:(content-empty absolute top-0 -left-2 h-full border-1 border-solid border-transparent border-b-0) px-4 py-2 decoration-none',
          props.depth && `before:border-l-${nestedColors[props.depth]}-5`
        )}
        style={{ 'margin-left': `${props.depth * 15}px` }}
      >
        <div class="flex items-center gap-2 text-0.7rem color-neutral-5 font-sans">
          <span>u/{props.author}</span>
          <span>{props.created}</span>
        </div>
        <div class="flex flex-col gap-4">
          <div class="pr-8 text-xs color-neutral-3">{props.body}</div>
          <PostInteractions totalComments={props.replies.length ?? 0} score={props.score ?? 0} />
        </div>
      </div>
      <For each={props.replies}>{(reply) => <CommentView {...comments[reply]} depth={props.depth + 1} />}</For>
    </div>
  );
};
