import { Comment } from '~/types';
import { useComments } from '../CommentsContext';
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
    <div class="flex flex-col">
      <div
        class={cn(
          'relative max-w-full flex flex-col gap-2 pl-8px -mt-4px border-b-solid border-b-2 border-b-dark-4 before:(content-empty absolute top-4px -left-0.5 h-[calc(100%-2px)] z-10 border-1 border-solid border-transparent border-b-0) px-4 py-4 decoration-none',
          props.depth && `before:border-l-${nestedColors[props.depth]}-5`
        )}
        style={{ 'margin-left': `${props.depth * 15}px` }}
      >
        <div class="flex items-center gap-2 text-0.7rem color-neutral-5 font-sans">
          <span>u/{props.author}</span>
          <span>{new Date(props.created).toLocaleString()}</span>
        </div>
        <div class="flex flex-col gap-4">
          <div class="pr-8 text-xs color-neutral-3" innerHTML={props.bodyHtml} />
          <PostInteractions totalComments={props.replies?.length ?? 0} score={props.score ?? 0} />
        </div>
      </div>
      <For each={props.replies}>{(reply) => <CommentView {...comments[reply]} depth={props.depth + 1} />}</For>
    </div>
  );
};
