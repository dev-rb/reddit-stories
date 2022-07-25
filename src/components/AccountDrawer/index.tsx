import { Button, Divider, Drawer, Group, Stack, Switch, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import * as React from 'react';
import { BsBookmarkFill, BsClockFill, BsHeartFill } from 'react-icons/bs';
import { MdHome } from 'react-icons/md';
import NavLink from '../NavLink';

interface AccountDrawerProps {
    opened: boolean,
    closeDrawer: () => void
}

const AccountDrawer = ({ closeDrawer, opened }: AccountDrawerProps) => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const theme = useMantineTheme();

    const session = useSession();

    const router = useRouter();

    const signOutUser = () => {
        signOut()
    }

    const navigateToSignIn = () => {
        router.push('/signin')
    }

    return (
        <>
            <Drawer
                opened={opened}
                onClose={() => closeDrawer()}
                position='right'
                padding='xl'
                size={'md'}
            >
                <Stack align='start' sx={{ height: '95%' }}>
                    <Stack spacing={'sm'}>
                        <Title order={3}> Welcome Back{session?.data?.user && ','} </Title>
                        {session.data && <Title sx={{ color: '#F8A130' }}> {session.data.user?.name} </Title>}
                    </Stack>
                    <Divider sx={{ width: '100%' }} />
                    <Stack mt={'lg'} justify='space-between' sx={{ height: '100%', width: '100%' }}>
                        <Stack align='start' spacing={'xl'} sx={{ height: '100%' }}>
                            <NavLink href='/' label='Home' icon={<MdHome />} />
                            <NavLink href='/likes' label='Your Likes' icon={<BsHeartFill />} />
                            <NavLink href='/saved' label='Your Favorites' icon={<BsBookmarkFill />} />
                            <NavLink href='/readlater' label='Your Read Later' icon={<BsClockFill />} />
                        </Stack>
                        <Stack>
                            {
                                session.status === 'authenticated' ?
                                    <Button fullWidth onClick={signOutUser}> Sign out </Button>
                                    :
                                    <Stack>
                                        <Title order={4}> Sign in to view your saved stories and prompts </Title>
                                        <Button fullWidth onClick={navigateToSignIn}> Sign in </Button>
                                    </Stack>

                            }
                            <Divider />
                            <Group position='center'>
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
}

export default AccountDrawer;