import * as React from 'react';
import { ActionIcon, Avatar, Box, Center, Group, Loader, Stack, TextInput, Title, useMantineColorScheme, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MdDownload, MdSearch } from 'react-icons/md';
import Post from '../components/Post';
import SortSelect, { SortType } from '../components/SortSelect';
import { CommentDetails } from '../interfaces/reddit';
import { trpc } from '../utils/trpc';

const Home = () => {

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const largeScreen = useMediaQuery('(min-width: 900px)');

  // const { data: adminData, isLoading: adminLoading } = trpc.useQuery(['admin.refetch'], {
  //   refetchInterval: 999999,
  //   refetchIntervalInBackground: false,
  //   staleTime: 99999999
  // })
  const { data: rqData, isLoading } = trpc.useQuery(['post.hot']);
  // const { data, isLoading } = useGetPostsQuery('hot');

  const onSortChange = (newType: SortType) => {
  }

  React.useEffect(() => {
    // console.log("Admin: ", adminData, "Is Loading: ", adminLoading)
    // console.log(rqData);
    // console.log("Test")

    // fetchCommentsForPost('/r/writingprompts', 'vik5jg').then((stories) => console.log(stories));
  }, [])

  return (
    <Stack align='center' sx={{ width: '100%', height: '100vh' }}>

      <Stack align='center' spacing={0} sx={{ width: largeScreen ? '40vw' : '100%' }}>
        <Stack p='lg' sx={{ width: '100%' }}>
          <Group noWrap align='start' position='apart' sx={{ width: '100%' }}>
            <Stack spacing={0}>
              <Title sx={{ fontWeight: 200 }}>Explore</Title>
              <Title >Stories</Title>
            </Stack>
            <Avatar radius={'xl'} onClick={() => { toggleColorScheme(); }} />
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
            <ActionIcon variant='filled' color='gray' onClick={() => { }}>
              <MdDownload />
            </ActionIcon>
          </Group>

          {!rqData && isLoading ?
            <Center>
              <Loader />
            </Center> :

            rqData?.map((post) => <Post key={post.id} {...post} created={post.created} totalStories={post.stories.length} />)

          }

        </Stack>
      </Stack>
    </Stack>
  );
}

export default Home;