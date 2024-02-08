import { ParentComponent, Show, createSignal, onMount } from 'solid-js';

export const ClientOnly: ParentComponent = (props) => {
  const [mounted, setMounted] = createSignal(false);

  onMount(() => setMounted(true));
  return <Show when={mounted()}>{props.children}</Show>;
};
