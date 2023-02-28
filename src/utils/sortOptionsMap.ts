import { SortType, RedditSortTypeConversion, TopTimeSort, TopSorts } from 'src/types/sorts';

export const sortTypeMap: { [key in SortType]: RedditSortTypeConversion } = {
  New: 'new',
  Popular: 'hot',
  Top: 'top',
};

export const topSortTypeMap: { [key in TopTimeSort]: TopSorts } = {
  Today: 'day',
  'This Week': 'week',
  'This Month': 'month',
  'This Year': 'year',
  'All Time': 'all',
};
