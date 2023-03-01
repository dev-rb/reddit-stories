import { createStyles } from '@mantine/core';
import { Status } from '.';

export const useStatusStyles = createStyles((theme, { downloaded, readLater, favorited }: Status) => ({
  download: {
    fill: downloaded ? '#F84B30' : undefined,
  },
  later: {
    fill: readLater ? '#F8A130' : undefined,
  },
  favorite: {
    fill: favorited ? '#30CFF8' : undefined,
  },
  base: {
    fill: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
  },
}));
