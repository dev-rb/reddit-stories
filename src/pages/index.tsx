import * as React from 'react';
import { ActionIcon, Avatar, Box, Center, Group, Loader, Stack, TextInput, Title, useMantineColorScheme, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MdDownload, MdSearch } from 'react-icons/md';
import Post from '../components/Post';
import SortSelect, { TopSorts, sortTypeMap, RedditSortTypeConversion, SortType, topSortTypeMap, TopTimeSort } from '../components/SortSelect';
import { trpc } from '../utils/trpc';
import ListVirtualizer from '../components/ListVirtualizer';
import { useQueries, useQueryClient } from 'react-query';
import { ExtendedReply, PromptAndStoriesWithReplies } from 'src/interfaces/db';
import ScrollToTopButton from 'src/components/ScrollToTop';
import { Story } from '@prisma/client';
import { set, update } from 'idb-keyval';
import { useRouter } from 'next/router';
import { useDownload } from 'src/hooks/useDownload';
import { DownloadContext } from './_app';
import { fetchSubredditPostsStream } from 'src/utils/redditApi';
import { useDispatch, useSelector } from 'react-redux';
import { downloadedPostsSelector, downloadPosts, PostsState } from 'src/redux/slices';

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
  const router = useRouter();

  const { sort, time } = router.query;

  const currentSort = sort ? sortTypeMap[sort.toString() as SortType].toString() : 'hot'
  const currentTime = time ? topSortTypeMap[time.toString() as TopTimeSort].toString() : 'day'

  const [sortType, setSortType] = React.useState<string>(currentSort);
  const [timeSort, setTimeSort] = React.useState(currentTime);

  const { download } = React.useContext(DownloadContext);

  const [isEnabled, setIsEnabled] = React.useState(false);

  const dispatch = useDispatch();

  const queryClient = useQueryClient();

  const selector = useSelector((state: PostsState) => downloadedPostsSelector(state, { sortType, timeSort }));

  // const trpcContext = trpc.useContext();

  const { data: rqData, isLoading, isFetching, isRefetching, refetch } = trpc.useQuery(['post.sort', { sortType: sortType as RedditSortTypeConversion, timeSort: sortType === 'hot' ? undefined : timeSort as TopSorts }], {
    enabled: true,
    onSuccess: (data) => console.log(`Data: `, data),
    initialData: () => {
      if (selector.length === 0) {
        console.log("Empty state")
        return
      }
      return selector.map((val) => {
        const { downloaded, ...rest } = val;
        return rest;
      });
    },
    // onSuccess: (data: PromptAndStoriesWithReplies[]) => queryClient.setQueryData(['post.sort'], () => data)
  });

  const onSortChange = (newType: string, timeSort?: string) => {
    setSortType(newType);
    if (timeSort) {
      setTimeSort(timeSort)
    }
  }

  const downloadPostsAndStories = () => {
    if (rqData) {
      dispatch(downloadPosts({ posts: rqData, sortType, timeSort }));
    }
  }

  React.useEffect(() => {
    setTimeout(() => {
      setIsEnabled(true);
    }, 1000)
  }, [])

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
            <ActionIcon variant='filled' color='gray' onClick={() => { downloadPostsAndStories!() }}>
              <MdDownload />
            </ActionIcon>
          </Group>

          {!rqData && (isLoading || isFetching || isRefetching) ?
            <Center>
              <Loader />
            </Center> :
            <ListVirtualizer data={rqData!} renderItem={(item, index) => {
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
                  <Post key={rqData![item.index].id} {...rqData![item.index]} created={rqData![item.index].created} totalStories={rqData![item.index].stories.length} index={index} />

                </div>
              )
            }}
            />
            // null
          }

        </Stack>
      </Stack>
    </Stack>
  );
}

export default Home;
