import { Avatar, Box, Center, Group, Paper, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/router';
import * as React from 'react';
import { MdKeyboardBackspace } from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import AccountDrawer from 'src/components/AccountDrawer';
import Comment from 'src/components/Comment';
import SortSelect from 'src/components/MobileSelect/SortSelect';
import Post from 'src/components/Post';
import VirtualizedDataDisplay from 'src/components/VirtualizedDataDisplay';
import { useUser } from 'src/hooks/useUser';
import { PostsState, postSelector } from 'src/redux/slices';
import { Prompt, Comments, IStory } from 'src/types/db';
import { trpc } from 'src/utils/trpc';
import { useStyles } from '../../styles/comments.styles';

export const CollapseContext = React.createContext<{
  state: Record<string, boolean>;
  collapseComment: (id: string, value?: boolean) => void;
}>({
  state: {},
  collapseComment: function (id: string, value?: boolean): void {
    this.state[id] = value ?? !this.state[id];
  },
});
export const useCollapsedState = () => React.useContext(CollapseContext);

const CommentsForPost = () => {
  const router = useRouter();
  const { id: postId } = router.query;

  if (!postId || Array.isArray(postId)) {
    return (
      <Center>
        <Text> Nothing here </Text>
      </Center>
    );
  }
  const theme = useMantineTheme();
  const largeScreen = useMediaQuery('(min-width: 900px)');
  const { classes } = useStyles({ largeScreen });

  const user = useUser();
  const queryClient = useQueryClient();

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [collapsedState, setCollapsedState] = React.useState<Record<string, boolean>>({});

  const postInfo = useSelector((state: PostsState) => postSelector(state, postId));
  const storiesDownloaded = useSelector((state: PostsState) => state.stories[postId]);

  const {
    data: storiesData,
    isLoading,
    isFetching,
    isRefetching,
    isError,
    error,
  } = trpc.useQuery(['story.forPost', { id: postId, userId: user.userId }], {
    initialData: () => {
      if (storiesDownloaded === undefined) {
        return;
      }
      return storiesDownloaded;
    },
  });
  const { data: postData } = trpc.useQuery(['post.byId', { id: postId, userId: user.userId }], {
    initialData: () => {
      if (postInfo === undefined) {
        const queryCache = queryClient.getQueryData(['post.sort']) as Prompt[];
        if (queryCache !== undefined) {
          const cacheInfo = queryCache.find((val) => val.id === postId);
          if (cacheInfo) {
            // console.log('Cached post: ', cacheInfo);
            return cacheInfo;
          }
        }
        return;
      }
      const { ...rest } = postInfo;
      return rest;
    },
  });

  const noComments = postData?.totalComments === 0;

  const getParentComments = (comments: Comments) => {
    return Object.values(comments).filter((val) => val.mainCommentId === null);
  };

  const collapseComment = React.useCallback(
    (id: string, value?: boolean) => {
      setCollapsedState((p) => ({ ...p, [id]: value ?? !p[id] }));
    },
    [postId]
  );

  React.useEffect(() => {
    if (storiesData) {
      setCollapsedState(
        Object.values(storiesData).reduce((acc, v) => {
          acc[v.id] = false;
          return acc;
        }, {} as Record<string, boolean>)
      );
    }
  }, [storiesData]);

  return (
    <Stack align="center">
      <Stack spacing={0} className={classes.container}>
        <Paper px="lg" py="xs" className={classes.header}>
          <Group noWrap align="start" position="apart" sx={{ width: '100%' }}>
            <MdKeyboardBackspace
              size={30}
              onClick={() => {
                router.back();
              }}
            />
            <Avatar
              radius={'xl'}
              onClick={() => {
                setDrawerOpen(true);
              }}
            />
            <AccountDrawer opened={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
          </Group>
        </Paper>
        {/* Post Details */}
        {postData && (
          <Box mt={60}>
            <Post
              {...postData}
              totalComments={postData.totalComments}
              isDownloaded={postInfo?.downloaded}
              liked={postData.liked}
            />
          </Box>
        )}
        <Stack spacing={0} pb={40}>
          <Group
            noWrap
            px="lg"
            py="xs"
            sx={{
              backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
            }}
          >
            <SortSelect />
          </Group>
          {noComments ? (
            <Center sx={{ height: '50vh' }}>
              <Title order={2} color={theme.colors.dark[3]}>
                No Stories Yet
              </Title>
            </Center>
          ) : (
            <CollapseContext.Provider value={{ state: collapsedState, collapseComment }}>
              <VirtualizedDataDisplay
                dataInfo={{
                  error,
                  isError,
                  isFetching,
                  isLoading,
                  isRefetching,
                  data: storiesData ? getParentComments(storiesData) : [],
                }}
                renderItem={(item: IStory & { replies: string[] }) => {
                  return (
                    <Comment
                      key={item.id}
                      {...item}
                      allReplies={storiesData ?? {}}
                      replies={item.replies}
                      postId={postId}
                      postAuthor={postData?.author ?? ''}
                      replyIndex={0}
                      isDownloaded={postInfo?.downloaded}
                    />
                  );
                }}
              />
            </CollapseContext.Provider>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CommentsForPost;
