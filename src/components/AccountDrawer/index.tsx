import { Button, Divider, Drawer, Group, Stack, Switch, Title, useMantineColorScheme } from '@mantine/core';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { BsBookmarkFill, BsClockFill, BsHeartFill } from 'react-icons/bs';
import { MdHome } from 'react-icons/md';
import { useUser } from 'src/hooks/useUser';
import { showSignOutNotification } from 'src/utils/notifications';

interface AccountDrawerProps {
  opened: boolean;
  closeDrawer: () => void;
}

const AccountDrawer = ({ closeDrawer, opened }: AccountDrawerProps) => {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const user = useUser();

  const router = useRouter();
  const { sort, time } = router.query;

  const signOutUser = () => {
    signOut();
    showSignOutNotification();
  };

  const navigateToSignIn = () => {
    router.push('/signin');
  };

  const homeUrl = `/${(sort ? '?sort=' + sort : '') + (time ? '&time=' + time : '')}`;

  return (
    <>
      <Drawer opened={opened} onClose={() => closeDrawer()} position="right" padding="xl" size={'md'}>
        <Stack align="start" sx={{ height: '95%' }}>
          <Stack spacing={'sm'}>
            <Title order={3}> Welcome Back{user.isAuthenticated && ','} </Title>
            {user.isAuthenticated && <Title sx={{ color: '#F8A130' }}> {user?.name} </Title>}
          </Stack>
          <Divider sx={{ width: '100%' }} />
          <Stack mt={'lg'} justify="space-between" sx={{ height: '100%', width: '100%' }}>
            <Stack align="start" spacing={'xl'} sx={{ height: '100%' }}>
              <NavLink href={homeUrl} label="Home" icon={<MdHome />} />
              <NavLink href="/history/likes" label="Your Likes" icon={<BsHeartFill />} />
              <NavLink href="/history/saved" label="Your Favorites" icon={<BsBookmarkFill />} />
              <NavLink href="/history/later" label="Your Read Later" icon={<BsClockFill />} />
            </Stack>
            <Stack>
              {user.isAuthenticated ? (
                <Button fullWidth onClick={signOutUser}>
                  Sign out
                </Button>
              ) : (
                <Stack>
                  <Title order={4}>Sign in to view your saved stories and prompts</Title>
                  <Button fullWidth onClick={navigateToSignIn}>
                    Sign in
                  </Button>
                </Stack>
              )}
              <Divider />
              <Group position="center">
                <Switch
                  label="Toggle Dark Mode"
                  checked={colorScheme === 'dark'}
                  onChange={() => toggleColorScheme()}
                  sx={{ flexDirection: 'row-reverse', alignItems: 'start' }}
                  styles={{ label: { paddingLeft: 0, paddingRight: 20 } }}
                />
              </Group>
            </Stack>
          </Stack>
        </Stack>
      </Drawer>
    </>
  );
};

export default AccountDrawer;

interface NavLinkProps {
  icon?: React.ReactNode;
  label: string;
  href: string;
}

const NavLink = ({ icon, label, href }: NavLinkProps) => {
  const router = useRouter();

  const navigate = () => {
    router.push(href);
  };

  return (
    <Button
      variant={router.pathname === href ? 'light' : 'subtle'}
      color={router.pathname === href ? 'blue' : 'dark'}
      size={'md'}
      fullWidth
      leftIcon={icon}
      sx={{ height: 46 }}
      styles={{
        inner: {
          justifyContent: 'start',
        },
      }}
      onClick={navigate}
    >
      {label}
    </Button>
  );
};
