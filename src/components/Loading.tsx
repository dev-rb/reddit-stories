import { OverrideComponentProps } from '~/types';
import { cn } from '~/utils/common';

interface LoadingProps extends OverrideComponentProps<'span', {}> {}
export const Loading = (props: LoadingProps) => {
  return <span {...props} class={cn('i-svg-spinners:180-ring inline-block', props.class)} />;
};
