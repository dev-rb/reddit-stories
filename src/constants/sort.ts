import { KebabSortTypes, SortTypes } from '~/types';

export const SORT_VALUES = ['Hot', 'New', 'Top Today', 'Top Week', 'Top Month', 'Top Year', 'Top All'] as const;
export const KEBAB_SORT_VALUES = ['hot', 'new', 'top-today', 'top-week', 'top-month', 'top-year', 'top-all'] as const;

export const SORT_MAP: Record<KebabSortTypes, SortTypes> = {
  hot: 'Hot',
  new: 'New',
  'top-all': 'Top All',
  'top-year': 'Top Year',
  'top-month': 'Top Month',
  'top-week': 'Top Week',
  'top-today': 'Top Today',
};
