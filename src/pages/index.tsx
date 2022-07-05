import * as React from 'react';
import { ActionIcon, Avatar, Box, Center, Group, Loader, Stack, TextInput, Title, useMantineColorScheme, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MdDownload, MdSearch } from 'react-icons/md';
import Post from '../components/Post';
import SortSelect, { TopSorts, sortTypeMap, RedditSortTypeConversion } from '../components/SortSelect';
import { trpc } from '../utils/trpc';
import ListVirtualizer from '../components/ListVirtualizer';
import { useQueries, useQueryClient } from 'react-query';
import { ExtendedReply, PromptAndStoriesWithReplies } from 'src/interfaces/db';
import ScrollToTopButton from 'src/components/ScrollToTop';
import { Story } from '@prisma/client';

const allQueries = [
  'hot',
  'new',
  { 'top': 'day' },
  { 'top': 'week' },
  { 'top': 'month' },
  { 'top': 'year' },
  { 'top': 'all' },
]

const Home = () => {

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  const largeScreen = useMediaQuery('(min-width: 900px)');

  const [sortType, setSortType] = React.useState<string>('hot');
  const [timeSort, setTimeSort] = React.useState('day');

  const queryClient = useQueryClient();

  const trpcContext = trpc.useContext();

  const { data: rqData, isLoading, isFetching, isRefetching } = trpc.useQuery(['post.sort', { sortType: sortType as RedditSortTypeConversion, timeSort: timeSort as TopSorts }], {
    onSuccess: (data: PromptAndStoriesWithReplies[]) => queryClient.setQueryData('post.sort', () => data)
  });

  // const testData = useQueries(rqData ? [...rqData!.map((val) => {
  //   return {
  //     queryKey: ['story.forPost', val.id],
  //     queryFn: () => trpcContext.client.query('story.forPost', { id: val.id })
  //   };
  // })] : []).map((val) => {

  //   return { ...val.data }
  // })

  // const { } = trpc.useQuery(['story.forPosts', [...rqData!.map((val) => ({ id: val.id }))]], {
  //   enabled: !!rqData
  // })


  const onSortChange = (newType: string, timeSort?: string) => {
    setSortType(newType);
    if (timeSort) {
      setTimeSort(timeSort)
    }
  }

  const getStories = async () => {
    const stories: (Story & { replies: ExtendedReply[]; })[][] = []
    rqData?.map((val) => trpcContext.client.query('story.forPost', { id: val.id }).then((data) => stories.push(data)))

    return stories;
  }

  React.useEffect(() => {
    if (rqData) {
      console.log("Stories: ", rqData)
    }
  }, [rqData])

  return (
    <Stack align='center' sx={{ width: '100%', height: '100vh' }}>
      <ScrollToTopButton />
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

          {!rqData && (isLoading || isFetching || isRefetching) ?
            <Center>
              <Loader />
            </Center> :
            <ListVirtualizer data={rqData!} />
            // null
          }

        </Stack>
      </Stack>
    </Stack>
  );
}

export default Home;
