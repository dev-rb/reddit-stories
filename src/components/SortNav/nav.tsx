import { Tabs } from '@kobalte/core';
import { For, ParentComponent } from 'solid-js';

const SORT_VALUES = ['Hot', 'New', 'Top Today', 'Top Week', 'Top Month', 'Top Year', 'Top All'] as const;

type SortTypes = (typeof SORT_VALUES)[number];

const toLowerKebab = (str: string) => {
  const lower = str.toLowerCase();

  return lower.replaceAll(' ', '-');
};

interface SortNavRootProps {}

export const SortNavRoot: ParentComponent = (props) => {
  return <Tabs.Root class="w-full">{props.children}</Tabs.Root>;
};

export const SortNavTabs = () => {
  return (
    <Tabs.List class="relative w-full flex items-center justify-evenly rounded-full bg-dark-8 px-4 py-3">
      <For each={SORT_VALUES}>{(value) => <SortTabTrigger value={toLowerKebab(value)} label={value} />}</For>
      <Tabs.Indicator class="absolute bottom-1 left-0 h-2px rounded-full bg-white transition-all duration-150" />
    </Tabs.List>
  );
};

interface SortNavContentProps {
  for: string;
}

export const SortNavContent: ParentComponent<SortNavContentProps> = (props) => {
  return <Tabs.Content value={props.for}>{props.children}</Tabs.Content>;
};

interface SortTabTriggerProps {
  value: string;
  label: string;
}

const SortTabTrigger = (props: SortTabTriggerProps) => {
  return (
    <Tabs.Trigger class="bg-transparent text-xs color-neutral-5 ui-selected:color-white" value={props.value}>
      {props.label}
    </Tabs.Trigger>
  );
};
