import * as React from 'react';
import { Anchor, Avatar, Center, Group, Stack, Title } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import AccountDrawer from 'src/components/AccountDrawer';
import { useUser } from 'src/hooks/useUser';
import Post from 'src/components/Post';
import Comment from 'src/components/Comment';
import { IStory, Prompt } from 'src/types/db';
import Link from 'next/link';
import VirtualizedDataDisplay from 'src/components/VirtualizedDataDisplay';
import TypeSelect, { StatusTypeSort } from 'src/components/MobileSelect/TypeSelect';
import { useUserSavedQuery } from 'src/hooks/useUserSavedQuery';

export type HistoryType = 'liked' | 'readLater' | 'favorited';

interface HistoryLayoutProps {
  historyType: HistoryType;
}

const HistoryLayout = ({ historyType }: HistoryLayoutProps) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const largeScreen = useMediaQuery('(min-width: 900px)');
  const [typeSort, setTypeSort] = React.useState<StatusTypeSort>('All');

  const user = useUser();

  const { data, isLoading, isError, error, isFetching, isRefetching } = useUserSavedQuery({
    statusToGet: historyType,
    filter: typeSort,
  });

  const isStory = (object: any): object is IStory => {
    return 'mainCommentId' in object;
  };

  const onSortChange = (newValue: StatusTypeSort) => {
    setTypeSort(newValue);
  };

  const getTitle = () => {
    const splitAtCase = historyType.replace(/([A-Z])/g, ' $1');
    const properCase = splitAtCase.charAt(0).toUpperCase() + splitAtCase.slice(1);
    return properCase;
  };

  return (
    <Stack align="center" sx={{ width: '100%', height: '100vh' }}>
      <Stack align="center" spacing={0} sx={{ width: largeScreen ? '40vw' : '100%' }}>
        <Stack p="lg" sx={{ width: '100%' }}>
          <Group noWrap align="start" position="apart" sx={{ width: '100%' }}>
            <Stack spacing={0}>
              <Title sx={{ fontWeight: 200 }}>Your</Title>
              <Title>{getTitle()}</Title>
            </Stack>
            <Avatar radius={'xl'} onClick={() => setDrawerOpen(true)} />
            <AccountDrawer opened={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
          </Group>
        </Stack>
        <Stack spacing={0} pb={40} sx={{ width: '100%' }}>
          <Group px="lg" pb="lg" pt="sm" align="center" position="apart">
            <TypeSelect onChange={onSortChange} />
            {/* <ActionIcon variant='filled' color='gray' ml={'auto'}>
                            <MdDownload />
                        </ActionIcon> */}
          </Group>
          {!user.isAuthenticated ? (
            <Center sx={{ height: '50vh' }}>
              <Title order={2} sx={(theme) => ({ color: theme.colors.dark[3] })}>
                You are not signed in!
              </Title>
            </Center>
          ) : data?.length === 0 ? (
            <Center sx={{ height: '50vh' }}>
              <Title order={2} sx={(theme) => ({ color: theme.colors.dark[3] })}>
                Nothing here!
              </Title>
            </Center>
          ) : (
            <VirtualizedDataDisplay
              dataInfo={{
                error,
                isError,
                isFetching,
                isLoading,
                isRefetching,
                data,
              }}
              renderItem={(currentItem: Prompt | IStory, index: number) => {
                return isStory(currentItem) ? (
                  <Anchor variant="text" component={Link} href={`/posts/${currentItem.postId}`}>
                    <div>
                      <Comment
                        key={currentItem.id}
                        {...(currentItem as IStory)}
                        allReplies={{}}
                        mainCommentId={currentItem.mainCommentId}
                        replies={[]}
                        postAuthor={''}
                        replyIndex={0}
                        isCollapsed={true}
                      />
                    </div>
                  </Anchor>
                ) : (
                  <Post
                    key={currentItem.id}
                    {...(currentItem as Prompt)}
                    title={(currentItem as Prompt).title}
                    favorited={currentItem.favorited}
                    liked={currentItem.liked}
                    readLater={currentItem.readLater}
                    userRead={currentItem.userRead}
                  />
                );
              }}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default HistoryLayout;
