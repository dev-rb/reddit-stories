import * as React from 'react';
import { ActionIcon, Avatar, Group, Stack, Title, Text, Button } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { MdCheckCircle, MdDownload, MdRefresh } from 'react-icons/md';
import Post from '../components/Post';
import { trpc } from '../utils/trpc';
import ScrollToTopButton from 'src/components/ScrollToTop';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { downloadedPostsSelector, downloadPosts, PostsState } from 'src/redux/slices';
import { useModals } from '@mantine/modals';
import { clearStorePosts } from 'src/redux/store';
import { SortType, TopTimeSort, RedditSortTypeConversion as SortTypeConversion, TopSorts } from 'src/types/sorts';
import { sortTypeMap, topSortTypeMap } from 'src/utils/sortOptionsMap';
import SortSelect from 'src/components/MobileSelect/SortSelect';
import { useQueryClient } from 'react-query';
import { Prompt, PromptAndStoriesWithNormalizedReplies } from 'src/types/db';
import AccountDrawer from 'src/components/AccountDrawer';
import { useUser } from 'src/hooks/useUser';
import { showDownloadNotification, updateDownloadNotification } from 'src/utils/notifications';
import VirtualizedDataDisplay from 'src/components/VirtualizedDataDisplay';

const Home = () => {
  const largeScreen = useMediaQuery('(min-width: 900px)');
  const router = useRouter();

  const { sort, time } = router.query;

  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const currentSort = sort ? sortTypeMap[sort.toString() as SortType].toString() : 'hot';
  const currentTime = time ? topSortTypeMap[time.toString() as TopTimeSort].toString() : undefined;

  const [sortType, setSortType] = React.useState<string>(currentSort);
  const [timeSort, setTimeSort] = React.useState<string | undefined>(currentTime);

  const [isDownloading, setIsDownloading] = React.useState(false);

  const dispatch = useDispatch();

  const modals = useModals();

  const selector = useSelector(
    (state: PostsState) =>
      downloadedPostsSelector({
        posts: state.posts,
        sortType,
        timeSort,
        stories: state.stories,
      }),
    (p, c) => p.length === c.length && p.every((post, i) => post.id === c[i].id)
  );

  const queryClient = useQueryClient();
  const trpcContext = trpc.useContext();

  const { userId } = useUser();

  const {
    data: postsData,
    isLoading,
    isFetching,
    isRefetching,
    refetch,
    error,
    isError,
  } = trpc.useQuery(
    [
      'post.sort',
      {
        sortType: sortType as SortTypeConversion,
        timeSort: timeSort as TopSorts,
        userId: userId,
      },
    ],
    {
      onSuccess: (data) => {
        queryClient.setQueryData(['post.sort'], () => data);
      },
      initialData: () => {
        if (selector.length === 0) {
          const cacheData = queryClient.getQueryData([
            'post.sort',
            {
              sortType: sortType as SortTypeConversion,
              timeSort: timeSort as TopSorts,
              userId,
            },
          ]) as Prompt[] | undefined;
          if (cacheData) {
            return cacheData.map((val) => {
              const { userRead, ...rest } = val;
              return rest;
            });
          }
          return;
        }
        return selector.map((val) => {
          const { userRead, sortType, timeSort, ...rest } = val;
          return rest;
        });
      },
    }
  );

  const onSortChange = (newType: string, timeSort?: string) => {
    setSortType(newType);
    setTimeSort(timeSort);
  };

  const batchAllDownload = async () => {
    if (postsData) {
      let allStories: Promise<PromptAndStoriesWithNormalizedReplies>[] = postsData.map((post) => {
        return trpcContext.fetchQuery(['story.forPost', { id: post.id }]).then((val) => {
          return { ...post, stories: val };
        });
      });

      const newPosts = await Promise.all(allStories);
      dispatch(downloadPosts({ posts: newPosts, sortType, timeSort }));
    }
  };

  const downloadPostsAndStories = () => {
    if (postsData) {
      setIsDownloading(true);
      showDownloadNotification(true);
      batchAllDownload();
    }
  };

  const handleRefresh = () => {
    const confirmRefresh = modals.openConfirmModal({
      title: 'Are you sure you want to refresh?',
      children: (
        <Text size="sm">
          Refreshing will get the newest posts, but will remove any downloaded posts. Are you sure you want to continue?
        </Text>
      ),
      centered: true,
      labels: { confirm: 'Continue', cancel: 'Cancel' },
      onCancel: () => modals.closeModal(confirmRefresh, true),
      onConfirm: () => {
        refetch();
        clearStorePosts({ sortType, timeSort });
      },
    });
  };

  React.useEffect(() => {
    if (selector.length !== 0) {
      setTimeout(() => {
        setIsDownloading(false);
        updateDownloadNotification(<MdCheckCircle />);
      }, 1500);
    }
  }, [selector]);

  return (
    <Stack align="center" sx={{ width: '100%', height: '100vh' }}>
      <ScrollToTopButton />
      <Stack align="center" spacing={0} sx={{ width: largeScreen ? '40vw' : '100%' }}>
        <Stack p="lg" sx={{ width: '100%' }}>
          <Group noWrap align="start" position="apart" sx={{ width: '100%' }}>
            <Stack spacing={0}>
              <Title sx={{ fontWeight: 300, fontFamily: 'Open Sans, sans-serif' }}>Tavern</Title>
              <Title sx={{ fontWeight: 700, fontFamily: 'Open Sans, sans-serif' }}>Tales</Title>
            </Stack>
            <Avatar
              radius={'xl'}
              onClick={() => {
                setDrawerOpen(true);
              }}
            />
            <AccountDrawer opened={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
          </Group>
        </Stack>
        <Stack spacing={0} sx={{ width: '100%' }}>
          <Group px="lg" pb="sm" pt="sm" noWrap align="center" position="apart">
            <SortSelect onChange={onSortChange} />
            <Group noWrap spacing={'sm'}>
              <ActionIcon
                variant="filled"
                color={selector?.length === 0 ? 'gray' : 'blue'}
                loading={isDownloading}
                onClick={downloadPostsAndStories}
              >
                <MdDownload />
              </ActionIcon>
            </Group>
          </Group>
          <Button
            radius={0}
            rightIcon={<MdRefresh size={18} />}
            color="gray"
            fullWidth
            onClick={handleRefresh}
            sx={{ alignSelf: 'center' }}
          >
            Refresh
          </Button>

          <VirtualizedDataDisplay
            dataInfo={{
              error,
              isError,
              isFetching,
              isLoading,
              isRefetching,
              data: postsData,
            }}
            renderItem={(item: Prompt, index: number) => {
              return (
                <Post
                  key={item.id}
                  {...item}
                  isDownloaded={selector.find((val) => val.id === item.id) !== undefined}
                  liked={item.liked}
                  readLater={item.readLater}
                  favorited={item.favorited}
                />
              );
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Home;
