import { Button } from '@mantine/core';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as React from 'react';

interface NavLinkProps {
    icon?: React.ReactNode,
    label: string,
    href: string
}

const NavLink = ({ icon, label, href }: NavLinkProps) => {

    const router = useRouter();

    const navigate = () => {
        router.push(href);
    }

    return (
        <Button
            variant={router.asPath === href ? 'light' : 'subtle'}
            color={router.asPath === href ? 'blue' : 'dark'}
            size={'md'}
            fullWidth
            leftIcon={icon}
            sx={{ height: 46 }}
            styles={{
                inner: {
                    justifyContent: 'start'
                }
            }}
            onClick={navigate}
        >
            {label}
        </Button>
    );
}

export default NavLink;