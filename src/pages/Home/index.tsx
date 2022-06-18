import * as React from 'react';
import { Stack, Group, Title, Avatar, TextInput, Box, NativeSelect, ActionIcon, Text, Center, useMantineColorScheme } from '@mantine/core';
import { MdSearch, MdArrowDropDown, MdDownload, MdHome, MdBookmarks } from 'react-icons/md';
import Post from '../../components/Post';
import { useMediaQuery } from '@mantine/hooks';
import { BsClockHistory } from 'react-icons/bs';
import { useGetPostsQuery } from '../../redux/services';
import { Loader } from '@mantine/core';
import { IPost } from '../../interfaces/reddit';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export const Home = () => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const { data, isLoading } = useGetPostsQuery('hot');

    return (
        <Stack align='center' sx={{ width: '100%', height: '100vh' }}>

            <Stack align='center' spacing={0} sx={{ width: largeScreen ? '40vw' : '100%' }}>
                <Stack p='lg' sx={{ width: '100%' }}>
                    <Group noWrap align='start' position='apart' sx={{ width: '100%' }}>
                        <Stack spacing={0}>
                            <Title sx={{ fontWeight: 200 }}>Explore</Title>
                            <Title >Stories</Title>
                        </Stack>
                        <Avatar radius={'xl'} onClick={() => toggleColorScheme()} />
                    </Group>

                    <TextInput variant='filled' size='lg' mt={40} icon={<MdSearch size={25} />} placeholder='Search Stories' sx={{ width: '100%' }} />
                    <Box mt={'lg'} sx={(theme) => ({ width: '100%', minHeight: '10rem', maxHeight: '14rem', backgroundColor: '#3079F8' })}>
                        <Text> Test </Text>
                    </Box>
                </Stack>
                <Stack spacing={0} sx={{ width: '100%' }}>
                    <Group px='lg' pb='lg' pt='sm' align='center' position='apart'>
                        <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} />
                        <ActionIcon variant='filled' color='gray'>
                            <MdDownload />
                        </ActionIcon>
                    </Group>

                    {!data && isLoading ?
                        <Center>
                            <Loader />
                        </Center> :

                        data?.map((post: IPost) => <Post key={post.id} {...post} />)

                    }

                </Stack>
            </Stack>
        </Stack>
    );
}
