import { Post } from '~/types/reddit';

interface PostRootProps extends Post {}
export const PostRoot = (props: PostRootProps) => {
  return <div></div>;
};
