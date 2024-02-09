import { Post } from '~/types/reddit';

interface PostRootProps extends Post {}
export const PostRoot = (props: PostRootProps) => {
  return (
    <div class="w-full flex flex-col gap-2 border-y-2 border-y-dark-4 border-y-solid px-4 py-2">
      <div class="flex items-center gap-2 text-xs color-neutral-5 font-sans">
        <span>u/author-name</span>
        <span>February 9th, 2024</span>
      </div>
      <div class="text-sm color-neutral-3">
        You are out with a friend when suddenly you blink and everything around you looks ruined and everyone looks like
        statues. A frail old man looks at you and weeps while he says “After 84 years, I finally was able to wake
        someone up”
      </div>
    </div>
  );
};
