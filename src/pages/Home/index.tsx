import { Stack, Group, Title, Avatar, TextInput, Box, NativeSelect, ActionIcon, Text, Center, useMantineColorScheme } from '@mantine/core';
import { MdSearch, MdArrowDropDown, MdDownload } from 'react-icons/md';
import Post from '../../components/Post';
import { useMediaQuery } from '@mantine/hooks';
import { useGetPostsQuery } from '../../redux/services';
import { Loader } from '@mantine/core';
import { IPost } from '../../interfaces/reddit';
import SortSelect, { SortType } from '../../components/SortSelect';

export const Home = () => {

    const { colorScheme, toggleColorScheme } = useMantineColorScheme();

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const { data, isLoading } = useGetPostsQuery('hot');

    const onSortChange = (newType: SortType) => {
    }

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
                    <Box mt={'lg'} sx={(theme) => ({ width: '100%', minHeight: '10rem', maxHeight: '14rem', borderRadius: '6px', backgroundColor: '#3079F8', boxShadow: '0px 14px 0px -8px #669EFE, 0px 24px 0px -12px #BBD4FF' })}>
                        <Text> Test </Text>
                    </Box>
                </Stack>
                <Stack spacing={0} sx={{ width: '100%' }}>
                    <Group px='lg' pb='lg' pt='sm' align='center' position='apart'>
                        <SortSelect onChange={onSortChange} />
                        {/* <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} /> */}
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
