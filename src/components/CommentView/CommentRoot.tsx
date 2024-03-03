import { Comment } from '~/types';
import { useComments } from '../CommentsContext';
import { PostInteractions } from '../Post/PostRoot';
import { For } from 'solid-js';
import { cn } from '~/utils/common';
import dayjs from '~/utils/dayjs';

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
          'relative max-w-full flex flex-col gap-2 -mt-2px border-y-2 border-y-dark-4 before:(content-empty absolute top-0px -left-0.5 h-[calc(100%+1px)] z-10 border-1 border-solid border-transparent border-b-0) py-4 decoration-none',
          props.depth && `before:border-l-${nestedColors[props.depth]}-5`,
          props.depth === 0 && `border-y-solid`
        )}
        style={{ 'margin-left': `${props.depth * 15}px` }}
      >
        <div
          class={cn('flex items-center gap-2 text-0.7rem color-neutral-5 font-sans', props.depth > 0 ? 'pl-2' : 'pl-4')}
        >
          <span>u/{props.author}</span>
          <span>{dayjs(props.created).fromNow()}</span>
        </div>
        <div class={cn('flex flex-col gap-4 pr-4 max-w-full', props.depth > 0 ? 'pl-2' : 'pl-4')}>
          <div
            class="text-xs color-neutral-3 [&_a]:color-blue-4 max-w-full [&_*]:(break-words whitespace-normal leading-[1.5])"
            innerHTML={props.bodyHtml}
          />
          <PostInteractions totalComments={props.replies?.length ?? 0} score={props.score ?? 0} />
        </div>
      </div>
      <For each={props.replies}>{(reply) => <CommentView {...comments[reply]} depth={props.depth + 1} />}</For>
    </div>
  );
};
