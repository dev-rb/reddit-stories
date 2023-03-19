import { createStyles } from '@mantine/core';
export const useStyles = createStyles((theme, { largeScreen }: { largeScreen: boolean }) => ({
  container: {
    width: largeScreen ? '40%' : '100%',
    borderLeft: largeScreen ? '2px solid' : 'unset',
    borderRight: largeScreen ? '2px solid' : 'unset',
    borderColor: theme.colors.dark[4],
  },
  header: {
    width: '100%',
    borderBottom: '2px solid',
    borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
    color: theme.colorScheme === 'dark' ? 'white' : theme.colors.dark,
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 15,
    transition: '0.5s ease-out',

    ['@media screen and (min-width: 900px)']: {
      width: '40%',
      left: '50%',
      right: '50%',
      transform: 'translateX(-50%)',
    },
  },
}));
