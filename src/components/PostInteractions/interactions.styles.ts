import { createStyles } from '@mantine/core';

export const useInteractionStyles = createStyles((theme, { liked }: { liked: boolean }) => ({
  like: {
    color: liked ? theme.colors.orange[4] : undefined,
  },
  baseInteraction: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
  },
}));
