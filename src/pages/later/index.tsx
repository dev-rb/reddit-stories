import * as React from 'react';
import { Stack, Group, Title, Avatar, TextInput, Box, ActionIcon, Center, Loader, useMantineColorScheme, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MdSearch, MdDownload } from 'react-icons/md';
import Post from '../../components/Post';
import { IPost } from '../../interfaces/reddit';
import SortSelect from 'src/components/MobileSelect/SortSelect';

const ReadLaterStories = () => {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const onSortChange = (newValue: string) => {
    }

    return (
        <Stack align='center' sx={{ width: '100%', height: '100vh' }}>

            <Stack align='center' spacing={0} sx={{ width: largeScreen ? '40vw' : '100%' }}>
                <Stack p='lg' sx={{ width: '100%' }}>
                    <Group noWrap align='start' position='apart' sx={{ width: '100%' }}>
                        <Stack spacing={0}>
                            <Title sx={{ fontWeight: 200 }}>For Later</Title>
                            <Title >Stories</Title>
                        </Stack>
                        <Avatar radius={'xl'} onClick={() => toggleColorScheme()} />
                    </Group>

                </Stack>
                <Stack spacing={0} sx={{ width: '100%' }}>
                    <Group px='lg' pb='lg' pt='sm' align='center' position='apart'>
                        <SortSelect onChange={() => { }} />
                        {/* <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} /> */}
                        <ActionIcon variant='filled' color='gray'>
                            <MdDownload />
                        </ActionIcon>
                    </Group>
                    {/* 
                    {!data && isLoading ?
                        <Center>
                            <Loader />
                        </Center> :

                        data?.map((post: IPost) => <Post key={post.id} {...post} />)

                    } */}

                </Stack>
            </Stack>
        </Stack>
    );
}

export default ReadLaterStories;