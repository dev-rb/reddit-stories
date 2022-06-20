import * as React from 'react';
import { ActionIcon, Avatar, Box, Center, ColorScheme, ColorSchemeProvider, Group, Loader, MantineProvider, Stack, TextInput, Title, useMantineColorScheme, Text } from '@mantine/core';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { useMediaQuery } from '@mantine/hooks';
import { BsClockHistory } from 'react-icons/bs';
import { MdHome, MdBookmarks, MdDownload, MdSearch } from 'react-icons/md';
import { ReactNode, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Post from '../components/Post';
import SortSelect, { SortType } from '../components/SortSelect';
import { IPost } from '../interfaces/reddit';
import { useGetPostsQuery } from '../redux/services';
import BottomNavigationBar from '../components/BottomNavigationBar';
import { trpc } from '../utils/trpc';

function App() {

  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (

    <Home />


  )
}

export default App

const Home = () => {

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const largeScreen = useMediaQuery('(min-width: 900px)');

  // const { data: rqData } = trpc.useQuery(['hello', { text: 'client' }]);
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
          <Box
            mt={'lg'}
            sx={(theme) => (
              {
                width: '100%',
                minHeight: '10rem',
                maxHeight: '14rem',
                borderRadius: '6px',
                backgroundColor: '#3079F8',
                boxShadow: `0px 14px 0px -8px ${theme.colorScheme === 'dark' ? '#3765B4' : '#669EFE'}, 0px 24px 0px -12px ${theme.colorScheme === 'dark' ? '#2F3F5B' : '#BBD4FF'}`
              }
            )}
          >
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