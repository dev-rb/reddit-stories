import { ValidComponent, ComponentProps } from 'solid-js';
import { SORT_VALUES } from '~/constants/sort';

export type ToKebab<T extends string> = T extends `${infer A} ${infer B}`
  ? `${Lowercase<A>}-${ToKebab<B>}`
  : Lowercase<T>;

export type SortTypes = (typeof SORT_VALUES)[number];
export type KebabSortTypes = ToKebab<SortTypes>;

// Taken from Kobalte: https://github.com/kobaltedev/kobalte/blob/main/packages/utils/src/props.ts#L13
/**
 * Allows for extending a set of props (`Source`) by an overriding set of props (`Override`),
 * ensuring that any duplicates are overridden by the overriding set of props.
 */
export type OverrideProps<Source = {}, Override = {}> = Omit<Source, keyof Override> & Override;

/**
 * Allows for extending a set of `ComponentProps` by an overriding set of props,
 * ensuring that any duplicates are overridden by the overriding set of props.
 */
export type OverrideComponentProps<T extends ValidComponent, P> = OverrideProps<ComponentProps<T>, P>;
