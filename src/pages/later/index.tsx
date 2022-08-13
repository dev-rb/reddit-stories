import * as React from 'react';
import { ActionIcon, Anchor, Avatar, Center, Group, Stack, Title, useMantineColorScheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MdDownload } from 'react-icons/md';
import AccountDrawer from 'src/components/AccountDrawer';
import { trpc } from 'src/utils/trpc';
import { useUser } from 'src/hooks/useUser';
import Post from 'src/components/Post';
import CommentDisplay from 'src/components/Comment';
import { IStory, Prompt } from 'src/interfaces/db';
import Link from 'next/link';
import VirtualizedDataDisplay from 'src/components/VirtualizedDataDisplay';
import TypeSelect, { StatusTypeSort } from 'src/components/MobileSelect/TypeSelect';
import { useUserSavedQuery } from 'src/hooks/useUserSavedQuery';

const UserReadLaterPage = () => {
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const largeScreen = useMediaQuery('(min-width: 900px)');
    const [typeSort, setTypeSort] = React.useState<StatusTypeSort>('All');

    const user = useUser();

    const { data: userLikes, isLoading, isError, error, isFetching, isRefetching } = useUserSavedQuery({ statusToGet: 'readLater', filter: typeSort });

    const isStory = (object: any): object is IStory => {
        return "mainCommentId" in object;
    }

    const onSortChange = (newValue: StatusTypeSort) => {
        setTypeSort(newValue);
    }

    return (
        <Stack align='center' sx={{ width: '100%', height: '100vh' }}>

            <Stack align='center' spacing={0} sx={{ width: largeScreen ? '40vw' : '100%' }}>
                <Stack p='lg' sx={{ width: '100%' }}>
                    <Group noWrap align='start' position='apart' sx={{ width: '100%' }}>
                        <Stack spacing={0}>
                            <Title sx={{ fontWeight: 200 }}>Your</Title>
                            <Title>Read Later</Title>
                        </Stack>
                        <Avatar radius={'xl'} onClick={() => setDrawerOpen(true)} />
                        <AccountDrawer opened={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
                    </Group>
                </Stack>
                <Stack spacing={0} pb={40} sx={{ width: '100%' }}>
                    <Group px='lg' pb='lg' pt='sm' align='center' position='apart'>
                        {/* <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} /> */}
                        <TypeSelect onChange={onSortChange} />
                        {/* <ActionIcon variant='filled' color='gray' ml={'auto'}>
                            <MdDownload />
                        </ActionIcon> */}
                    </Group>

                    {
                        !user.isAuthenticated ?
                            <Center sx={{ height: '50vh' }}>
                                <Title order={2} sx={(theme) => ({ color: theme.colors.dark[3] })}>You are not signed in!</Title>
                            </Center>
                            :
                            userLikes?.length === 0 ?
                                <Center sx={{ height: '50vh' }}>
                                    <Title order={2} sx={(theme) => ({ color: theme.colors.dark[3] })}>No Read Laters</Title>
                                </Center>
                                :
                                <VirtualizedDataDisplay
                                    dataInfo={{ error, isError, isFetching, isLoading, isRefetching, data: userLikes }}
                                    renderItem={(currentItem: Prompt | IStory, index: number) => {
                                        return (
                                            (isStory(currentItem)) ?
                                                <Anchor variant='text' component={Link} href={`/posts/${currentItem.postId}`} >
                                                    <div>
                                                        <CommentDisplay
                                                            key={currentItem.id}
                                                            {...currentItem as IStory}
                                                            allReplies={{}}
                                                            mainCommentId={currentItem.mainCommentId}
                                                            replies={[]}
                                                            postAuthor={''}
                                                            replyIndex={0}
                                                            isCollapsed={true} />
                                                    </div>
                                                </Anchor>
                                                :
                                                <Post
                                                    key={currentItem.id}
                                                    {...currentItem as Prompt}
                                                    title={(currentItem as Prompt).title}
                                                    index={index}
                                                    favorited={currentItem.favorited}
                                                    liked={currentItem.liked}
                                                    readLater={currentItem.readLater}
                                                    userRead={currentItem.userRead}
                                                />
                                        )
                                    }}
                                />
                    }
                </Stack>
            </Stack>
        </Stack>
    )
}

export default UserReadLaterPage;