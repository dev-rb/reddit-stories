import { Tabs } from '@kobalte/core';
import {
  TabsContentProps,
  TabsIndicatorProps,
  TabsListProps,
  TabsRootProps,
  TabsTriggerProps,
} from '@kobalte/core/dist/types/tabs';
import { For, ParentComponent, splitProps } from 'solid-js';
import { SORT_VALUES } from '~/constants/sort';
import { KebabSortTypes, ToKebab } from '~/types';
import { cn } from '~/utils/common';

const toLowerKebab = <T extends string>(str: T): ToKebab<T> => {
  const lower = str.toLowerCase();

  return lower.replaceAll(' ', '-') as ToKebab<T>;
};

interface SortTabsRootProps extends TabsRootProps {}

const SortTabsRoot = (props: SortTabsRootProps) => {
  return (
    <Tabs.Root {...props} class={cn('w-full', props.class)}>
      {props.children}
    </Tabs.Root>
  );
};

interface SortTabsListProps {
  root?: TabsListProps;
  trigger?: TabsTriggerProps;
  indicator?: TabsIndicatorProps;
}

const SortTabsList = (props: SortTabsListProps) => {
  return (
    <Tabs.List
      {...props.root}
      class={cn('relative w-full flex items-center justify-evenly rounded-full bg-dark-8 px-4 py-3', props.root?.class)}
    >
      <For each={SORT_VALUES}>
        {(value) => (
          <SortTabsTrigger {...props.trigger} value={toLowerKebab(value)} label={value.split(' ')[1] ?? value} />
        )}
      </For>
      <Tabs.Indicator
        {...props.indicator}
        class={cn(
          'absolute bottom-1 left-0 h-2px rounded-full bg-white transition-all duration-150',
          props.indicator?.class
        )}
      />
    </Tabs.List>
  );
};

interface SortTabsContentProps extends TabsContentProps {
  value: KebabSortTypes;
}

const SortTabsContent: ParentComponent<SortTabsContentProps> = (props) => {
  return <Tabs.Content {...props}>{props.children}</Tabs.Content>;
};

interface SortTabsTriggerProps extends Omit<TabsTriggerProps, 'value'> {
  label: string;
  value: KebabSortTypes;
}

const SortTabsTrigger = (props: SortTabsTriggerProps) => {
  const [self, other] = splitProps(props, ['class', 'label']);
  return (
    <Tabs.Trigger {...other} class={cn('bg-transparent text-xs color-neutral-5 ui-selected:color-white', self.class)}>
      {self.label}
    </Tabs.Trigger>
  );
};
export { SortTabsList as TabsView, SortTabsRoot as Root, SortTabsContent as Content };
