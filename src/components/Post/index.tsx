import * as React from 'react';
import { Anchor, Box, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PostInteractions from '../PostInteractions';
import { Prompt } from 'src/types/db';
import { useQueryClient } from 'react-query';
import { useDispatch, useSelector } from 'react-redux';
import { getPostStatuses, PostsState, updatePostStatus } from 'src/redux/slices';
import { PostStatus } from 'src/server/routers/post';
import { StatusIndicators } from '../StatusIndicators';

dayjs.extend(relativeTime);

interface PostStatuses {
  downloaded: boolean;
  liked: boolean;
  favorited: boolean;
  readLater: boolean;
  userRead: boolean;
}

const Post = ({
  title,
  id,
  score,
  author,
  totalComments,
  created,
  isDownloaded,
  liked: postLiked,
  favorited: postSaved,
  readLater: postReadLater,
}: Prompt & { isDownloaded?: boolean }) => {
  const localPostStatus = useSelector((state: PostsState) => getPostStatuses(state, id));

  const [{ downloaded, favorited, liked, readLater, userRead }, setPostStatuses] = React.useState<PostStatuses>({
    downloaded: localPostStatus?.downloaded ?? false,
    liked: postLiked ?? localPostStatus?.liked ?? false,
    favorited: postSaved ?? localPostStatus?.favorited ?? false,
    readLater: postReadLater ?? localPostStatus?.readLater ?? false,
    userRead: localPostStatus?.userRead ?? false,
  });

  const postRef = React.useRef<HTMLDivElement>(null);

  const largeScreen = useMediaQuery('(min-width: 900px)');

  const theme = useMantineTheme();

  const queryClient = useQueryClient();

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (isDownloaded !== undefined) {
      setPostStatuses((prev) => ({ ...prev, downloaded: isDownloaded }));
    }
  }, [isDownloaded]);

  const markAsRead = () => {
    dispatch(
      updatePostStatus({
        postId: id,
        newStatusValue: true,
        statusToUpdate: 'userRead',
      })
    );
    const queryCache = queryClient.getQueryData(['post.sort']) as Prompt[];
    if (queryCache) {
      queryCache.forEach((val) => {
        if (val.id === id) {
          val.userRead = true;
        }
      });
    }
  };

  const toggleStatus = (status: PostStatus) => {
    setPostStatuses((prev) => ({ ...prev, [status]: !prev[status] }));
  };

  React.useEffect(() => {
    const queryCache = queryClient.getQueryData(['post.sort']) as Prompt[];
    if (queryCache) {
      queryCache.forEach((val) => {
        if (val.id === id) {
          if (val.userRead || val.liked || val.readLater || val.favorited) {
            setPostStatuses((prev) => ({
              ...prev,
              userRead: val.userRead ?? prev.userRead,
              liked: val.liked ?? prev.liked,
              favorited: val.favorited ?? prev.favorited,
              readLater: val.readLater ?? prev.readLater,
            }));
          }
        }
      });
    }
  }, [queryClient, id]);

  return (
    <Anchor variant="text" component={Link} href={`/posts/${id}`}>
      <Box
        ref={postRef}
        px="lg"
        py="sm"
        onClick={markAsRead}
        mt={-1}
        sx={(theme) => ({
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
          width: largeScreen ? '100%' : '100vw',
        })}
      >
        <Stack sx={{ width: '100%' }} spacing={'md'}>
          <Group align="center" position="apart">
            <Group
              noWrap
              spacing={4}
              align="center"
              sx={(theme) => ({
                color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5],
              })}
            >
              <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>
                u/{author}
              </Title>
              <Text size="lg">·</Text>
              <Text size="xs">{dayjs(created).fromNow()}</Text>
            </Group>
            <StatusIndicators downloaded={downloaded} readLater={readLater} favorited={favorited} />
          </Group>
          <Text
            size="sm"
            weight={500}
            color={
              userRead
                ? theme.colorScheme === 'dark'
                  ? theme.colors.dark[3]
                  : theme.colors.gray[6]
                : theme.colorScheme === 'dark'
                ? theme.colors.gray[0]
                : theme.black
            }
          >
            {title.replace('[WP]', '').trim()}
          </Text>
          <PostInteractions
            postInfo={{ title, id, score, author, created, totalComments }}
            liked={liked}
            favorited={favorited}
            readLater={readLater}
            toggleStatus={toggleStatus}
          />
        </Stack>
      </Box>
    </Anchor>
  );
};

export default Post;
