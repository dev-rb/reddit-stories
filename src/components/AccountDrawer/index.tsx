import { Button, Drawer, Stack, Switch, Title, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import * as React from 'react';

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
                size={'sm'}
            >
                <Stack align='start' sx={{ height: '85%' }}>
                    <Stack spacing={'sm'}>
                        <Title order={3}> Welcome Back{session?.data?.user && ','} </Title>
                        {session.data && <Title sx={{ color: '#F8A130' }}> {session.data.user?.name} </Title>}

                    </Stack>
                    <Stack mt={'lg'} justify='space-between' sx={{ height: '100%', width: '100%' }}>
                        <Switch
                            label="Toggle Dark Mode"
                            checked={colorScheme === 'dark'}
                            onChange={() => toggleColorScheme()}
                            sx={{ flexDirection: 'column-reverse', alignItems: 'start' }}
                            styles={{ label: { paddingLeft: 0, paddingBottom: 10 } }}
                        />
                        {
                            session.status === 'authenticated' ?
                                <Button fullWidth onClick={signOutUser}> Sign out </Button>
                                :
                                <Stack>
                                    <Title order={4}> Sign in to view your saved stories and prompts </Title>
                                    <Button fullWidth onClick={navigateToSignIn}> Sign in </Button>
                                </Stack>

                        }
                    </Stack>
                </Stack>
            </Drawer>
        </>
    );
}

export default AccountDrawer;