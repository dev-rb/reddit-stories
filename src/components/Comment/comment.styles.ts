import { createStyles } from '@mantine/core';
import { nestedColors } from 'src/utils/nestedColors';

export const useCommentStyles = createStyles(
  (theme, { liked, replyIndex, collapsed }: { liked: boolean; replyIndex: number; collapsed: boolean }) => ({
    rootContainer: {
      position: 'relative',
      marginLeft: replyIndex > 0 && replyIndex < 12 ? 8 : 0,
      borderLeft: replyIndex > 0 ? `1px solid ${theme.colors.dark[4]}` : 'unset',
      // height: collapsed ? 80 : 'unset',
      overflow: collapsed ? 'hidden' : 'unset',
    },
    commentContainer: {
      borderBottom: '1px solid',
      borderTop: '1px solid',
      borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
      userSelect: 'none',
      // height: collapsed ? 80 : 'unset',
      overflow: collapsed ? 'hidden' : 'unset',
    },
    commentDetails: {
      color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
    },
    likeButton: {
      color: liked
        ? theme.colors.orange[4]
        : theme.colorScheme === 'dark'
        ? theme.colors.dark[3]
        : theme.colors.gray[6],
    },
    repliesContainer: {
      [`#root-container > div:is(#parent-reply)`]: {
        borderLeft: `2px solid ${theme.colors[nestedColors[replyIndex] ?? 'indigo'][5]}`,
      },
      // height: collapsed ? 0 : 'unset',
    },
    collapsedReadButton: {
      height: 60,
      position: 'absolute',
      bottom: 0,
      background: `linear-gradient(transparent 10%, ${theme.colors.dark[theme.colorScheme === 'dark' ? 9 : 0]})`,
      width: '100%',
      zIndex: 99,
    },
  })
);
