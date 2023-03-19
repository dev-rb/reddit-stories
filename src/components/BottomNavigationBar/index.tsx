import { ActionIcon, Group, Stack, Text, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ReactNode, useRef } from 'react';
import { BsClockHistory, BsHeartFill } from 'react-icons/bs';
import { MdHome, MdBookmarks } from 'react-icons/md';
import useScrollDownHide from 'src/hooks/useScrollDownHide';

interface NavLinkProps {
  label?: string;
  pathTo: string;
  icon: ReactNode;
}

const NavLink = ({ icon, pathTo, label }: NavLinkProps) => {
  const router = useRouter();

  const theme = useMantineTheme();

  const isActive = router.pathname === pathTo;

  return (
    <Link href={pathTo} passHref>
      <Stack spacing={0} align="center">
        <ActionIcon
          variant="transparent"
          size="lg"
          sx={{
            color: isActive
              ? theme.colorScheme === 'dark'
                ? theme.black
                : 'white'
              : theme.colorScheme === 'dark'
              ? theme.colors.dark[2]
              : theme.colors.dark[4],
          }}
        >
          {icon}
        </ActionIcon>
        <Text
          color={
            isActive
              ? theme.colorScheme === 'dark'
                ? theme.black
                : 'white'
              : theme.colorScheme === 'dark'
              ? theme.colors.dark[2]
              : theme.colors.dark[4]
          }
          weight={600}
          size="sm"
        >
          {' '}
          {label}{' '}
        </Text>
        {/* {isActive &&
                    <Text color={isActive ? (theme.colorScheme === 'dark' ? theme.black : 'white') : theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.dark[4]} weight={600} size='sm'> {label} </Text>
                } */}
      </Stack>
    </Link>
  );
};

const navLinks: NavLinkProps[] = [
  {
    label: 'Home',
    pathTo: '/',
    icon: <MdHome size={25} />,
  },
  {
    label: 'Likes',
    pathTo: '/likes',
    icon: <BsHeartFill size={25} />,
  },
  {
    label: 'Saved',
    pathTo: '/saved',
    icon: <MdBookmarks size={25} />,
  },
  {
    label: 'Read Later',
    pathTo: '/later',
    icon: <BsClockHistory size={25} />,
  },
];

const BottomNavigationBar = () => {
  const largeScreen = useMediaQuery('(min-width: 900px)');

  const ref = useRef<HTMLDivElement>(null);
  useScrollDownHide({
    ref,
    animateOut: true,
    enter: (element) => {
      element.style.transform = 'translate(-50%, 0)';
    },
    exit: (element) => {
      element.style.transform = 'translate(-50%, 40px)';
    },
  });

  return (
    <Group
      ref={ref}
      noWrap
      px={40}
      pt="sm"
      pb={4}
      align="center"
      position="apart"
      sx={(theme) => ({
        background: theme.colorScheme === 'dark' ? 'white' : theme.colors.dark[8],
        position: 'fixed',
        bottom: 0,
        borderRadius: '10px 10px 0 0',
        width: largeScreen ? '40vw' : '100%',
        left: '50%',
        transform: 'translate(-50%, 0)',
        transition: '0.35s ease',
      })}
    >
      {navLinks.map((navLink) => (
        <NavLink key={navLink.pathTo} {...navLink} />
      ))}
    </Group>
  );
};

export default BottomNavigationBar;
