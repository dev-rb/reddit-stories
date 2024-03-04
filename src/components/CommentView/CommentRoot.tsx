import { Comment } from '~/types';
import { useComments } from '../CommentsContext';
import { PostInteractions } from '../Post/PostRoot';
import { For, Show, createSignal } from 'solid-js';
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
  index: number;
  depth: number;
}

export const CommentView = (props: CommentViewProps) => {
  const comments = useComments();

  const [collapsed, setCollapsed] = createSignal(false);

  return (
    <div class="flex flex-col">
      <div
        class={cn(
          'relative max-w-full flex flex-col gap-2 -mt-2px border-y-2 border-y-dark-4 before:(content-empty absolute top-0px -left-0.5 h-[calc(100%+1px)] z-10 border-1 border-solid border-transparent border-b-0) py-4 decoration-none',
          props.depth && `before:border-l-${nestedColors[props.depth]}-5/50`,
          props.depth === 0 && props.index !== 0 && `border-y-solid`,
          props.index === 0 && `border-b-solid`,
          collapsed() && 'h-0 pt-2 pb-6'
        )}
        onClick={() => setCollapsed((p) => !p)}
        style={{ 'margin-left': `${props.depth * 15}px` }}
      >
        <div
          class={cn('flex items-center gap-2 text-0.7rem color-neutral-5 font-sans', props.depth > 0 ? 'pl-2' : 'pl-4')}
        >
          <span
            class={cn(props.mainCommentId && props.author === comments[props.mainCommentId].author && 'color-blue-4')}
          >
            u/{props.author}
          </span>
          <span>{dayjs(props.created).fromNow()}</span>
          <Show when={collapsed()}>
            <span>{props.replies.length} comments</span>
          </Show>
        </div>
        <div class={cn('overflow-hidden flex flex-col gap-4 pr-4 max-w-full', props.depth > 0 ? 'pl-2' : 'pl-4')}>
          <div
            class="text-xs color-neutral-3 [&_a]:color-blue-4 max-w-full [&_*]:(break-words whitespace-normal leading-[1.5])"
            innerHTML={props.bodyHtml}
          />
          <PostInteractions totalComments={props.replies?.length ?? 0} score={props.score ?? 0} />
        </div>
      </div>
      <For each={props.replies}>
        {(reply) => <CommentView {...comments[reply]} index={1} depth={props.depth + 1} />}
      </For>
    </div>
  );
};
