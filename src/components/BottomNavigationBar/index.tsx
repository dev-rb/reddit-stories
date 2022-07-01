import { ActionIcon, Group } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import Link from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { BsChevronDoubleUp, BsClockHistory } from "react-icons/bs";
import { MdHome, MdBookmarks } from "react-icons/md";

interface NavLinkProps {
    pathTo: string,
    icon: ReactNode
}

const NavLink = ({ icon, pathTo }: NavLinkProps) => {
    const router = useRouter();

    const isActive = router.pathname === pathTo;

    return (
        <Link href={pathTo} passHref>
            <ActionIcon variant='transparent' size='lg' sx={(theme) => ({ color: isActive ? (theme.colorScheme === 'dark' ? theme.black : 'white') : theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.dark[4] })}>
                {icon}
            </ActionIcon>
        </Link>
    )
}

const navLinks: NavLinkProps[] = [
    {
        pathTo: '/',
        icon: <MdHome size={25} />
    },
    {
        pathTo: '/saved',
        icon: <MdBookmarks size={25} />
    },
    {
        pathTo: '/later',
        icon: <BsClockHistory size={25} />
    }
]

const BottomNavigationBar = () => {
    const largeScreen = useMediaQuery('(min-width: 900px)');

    return (
        <Group noWrap px={40} py='sm' align='center' position='apart' sx={(theme) => ({ background: theme.colorScheme === 'dark' ? 'white' : theme.colors.dark[8], position: 'fixed', bottom: 20, borderRadius: 10, width: largeScreen ? '20vw' : '70vw', left: '50%', transform: 'translateX(-50%)' })}>
            {navLinks.map((navLink) => <NavLink key={navLink.pathTo} {...navLink} />)}
        </Group>
    )
}


export default BottomNavigationBar;