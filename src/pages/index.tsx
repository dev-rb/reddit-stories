import * as React from 'react';
import { ActionIcon, Avatar, Box, Center, Group, Loader, Stack, TextInput, Title, useMantineColorScheme, Text, Button } from '@mantine/core';
import { useDidUpdate, useMediaQuery } from '@mantine/hooks';
import { MdDownload, MdRefresh, MdSearch } from 'react-icons/md';
import Post from '../components/Post';
import { trpc } from '../utils/trpc';
import ListVirtualizer from '../components/ListVirtualizer';
import ScrollToTopButton from 'src/components/ScrollToTop';
import { useRouter } from 'next/router';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { downloadedPostsSelector, downloadPosts, PostsState } from 'src/redux/slices';
import { useModals } from '@mantine/modals';
import { clearStorePosts } from 'src/redux/store';
import { SortType, TopTimeSort, RedditSortTypeConversion, TopSorts } from 'src/interfaces/sorts';
import { sortTypeMap, topSortTypeMap } from 'src/utils/sortOptionsMap';
import SortSelect from 'src/components/MobileSelect/SortSelect';

const Home = () => {

  const { toggleColorScheme } = useMantineColorScheme();

  const largeScreen = useMediaQuery('(min-width: 900px)');
  const router = useRouter();

  const { sort, time } = router.query;

  const currentSort = sort ? sortTypeMap[sort.toString() as SortType].toString() : 'hot'
  const currentTime = time ? topSortTypeMap[time.toString() as TopTimeSort].toString() : undefined

  const [sortType, setSortType] = React.useState<string>(currentSort);
  const [timeSort, setTimeSort] = React.useState<string | undefined>(currentTime);

  const [isDownloading, setIsDownloading] = React.useState(false);

  const dispatch = useDispatch();

  const modals = useModals();

  const selector = useSelector((state: PostsState) => downloadedPostsSelector({ posts: state.posts, sortType, timeSort }), shallowEqual);


  const { data: rqData, isLoading, isFetching, isRefetching, refetch } = trpc.useQuery(['post.sort', { sortType: sortType as RedditSortTypeConversion, timeSort: sortType === 'hot' ? undefined : timeSort as TopSorts }], {
    enabled: true,
    // onSuccess: (data) => console.log(`Data: `, data),
    initialData: () => {
      if (selector.length === 0) {
        // console.log("Empty state")
        return
      }
      return selector.map((val) => {
        const { downloaded, ...rest } = val;
        return rest;
      });
    },
  });

  const onSortChange = (newType: string, timeSort?: string) => {
    setSortType(newType);
    setTimeSort(timeSort)

  }

  const downloadPostsAndStories = () => {
    if (rqData) {
      setIsDownloading(true);
      dispatch(downloadPosts({ posts: rqData, sortType, timeSort }));

    }
  }

  const handleRefresh = () => {
    const confirmRefresh = modals.openConfirmModal({
      title: 'Are you sure you want to refresh?',
      children: (
        <Text size="sm">
          Refreshing will get the newest posts, but will remove any downloaded posts.
          Are you sure you want to continue?
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Continue', cancel: 'Cancel' },
      onCancel: () => modals.closeModal(confirmRefresh, true),
      onConfirm: () => {
        refetch();
        clearStorePosts({ sortType, timeSort });
      },
    })
  }

  React.useEffect(() => {
    if (selector.length !== 0) {
      setTimeout(() => {
        setIsDownloading(false);
      }, 1500)
    }
  }, [selector])

  useDidUpdate(() => {
    console.log("Update")
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
          <Group px='lg' pb='sm' pt='sm' noWrap align='center' position='apart'>
            <SortSelect onChange={onSortChange} />
            <Group noWrap spacing={'sm'}>
              {/* <Button rightIcon={<MdRefresh size={18} />} compact color='blue'> Refresh </Button> */}
              {/* <Button rightIcon={<MdRefresh size={18} />} compact color='gray'> Refresh </Button> */}
              {/* <ActionIcon variant='filled' color={'gray'} loading={isDownloading} onClick={() => { downloadPostsAndStories!() }}>
                <MdRefresh />
              </ActionIcon> */}
              <ActionIcon variant='filled' color={selector?.length === 0 ? 'gray' : 'blue'} loading={isDownloading} onClick={() => { downloadPostsAndStories!() }}>
                <MdDownload />
              </ActionIcon>
            </Group>
          </Group>
          <Button radius={0} rightIcon={<MdRefresh size={18} />} color='gray' fullWidth onClick={handleRefresh} sx={{ alignSelf: 'center' }}> Refresh </Button>

          {!rqData && (isLoading || isFetching || isRefetching) ?
            <Center>
              <Loader />
            </Center> :
            <ListVirtualizer data={rqData!} renderItem={(item, index) => {
              const currentItem = rqData![item.index];
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
                  <Post key={currentItem.id}
                    {...currentItem}
                    created={currentItem.created}
                    totalStories={currentItem.stories.length}
                    index={index}
                    isDownloaded={selector.find((val) => val.id === currentItem.id) !== undefined}
                  />

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
