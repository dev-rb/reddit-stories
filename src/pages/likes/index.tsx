import * as React from 'react';
import { ActionIcon, Avatar, Center, Group, Loader, Stack, Text, Title, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MdDownload } from 'react-icons/md';
import SortSelect from 'src/components/MobileSelect/SortSelect';
import AccountDrawer from 'src/components/AccountDrawer';
import { trpc } from 'src/utils/trpc';
import { useUser } from 'src/hooks/useUser';
import Post from 'src/components/Post';
import ListVirtualizer from 'src/components/ListVirtualizer';

const UserLikesPage = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const largeScreen = useMediaQuery('(min-width: 900px)');
    const { userId } = useUser();
    const { data: userLikes, isLoading, isError, error } = trpc.useQuery(['post.getLikes', { userId }], {
        refetchOnMount: 'always',
    })

    const onSortChange = (newValue: string) => {
    }

    return (
        <Stack align='center' sx={{ width: '100%', height: '100vh' }}>

            <Stack align='center' spacing={0} sx={{ width: largeScreen ? '40vw' : '100%' }}>
                <Stack p='lg' sx={{ width: '100%' }}>
                    <Group noWrap align='start' position='apart' sx={{ width: '100%' }}>
                        <Stack spacing={0}>
                            <Title sx={{ fontWeight: 200 }}>Your</Title>
                            <Title>Likes</Title>
                        </Stack>
                        <Avatar radius={'xl'} onClick={() => setDrawerOpen(true)} />
                        <AccountDrawer opened={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
                    </Group>
                </Stack>
                <Stack spacing={0} pb={40} sx={{ width: '100%' }}>
                    <Group px='lg' pb='lg' pt='sm' align='center' position='apart'>
                        {/* <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} /> */}
                        <ActionIcon variant='filled' color='gray' ml={'auto'}>
                            <MdDownload />
                        </ActionIcon>
                    </Group>

                    {isLoading ?
                        <Center>
                            <Loader />
                        </Center> :
                        isError ?
                            <Center>
                                <Text> {error.message} </Text>
                            </Center>
                            :
                            <ListVirtualizer data={userLikes!} renderItem={(item, index) => {
                                const currentItem = userLikes![item.index];
                                return (
                                    <div
                                        key={item.index}
                                        ref={item.measureElement}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            // height: `${item.size}px`,
                                            transform: `translateY(${item.start}px)`,
                                        }}
                                    >
                                        <Post
                                            key={currentItem.id}
                                            {...currentItem}
                                            index={index}
                                        />

                                    </div>
                                )
                            }}
                            />
                    }
                </Stack>
            </Stack>
        </Stack>
    )
}

export default UserLikesPage;