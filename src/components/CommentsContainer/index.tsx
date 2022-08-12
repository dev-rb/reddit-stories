import * as React from 'react';
import { IPost } from '../../interfaces/reddit';
import { MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import { createStyles, Group, Paper, Stack, Box, Title, Center, Avatar } from '@mantine/core';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import Post from '../Post';
import { useMediaQuery } from '@mantine/hooks';
import { useQueryClient } from 'react-query';
import { useSelector } from 'react-redux';
import { postSelector, PostsState } from 'src/redux/slices';
import SortSelect from '../MobileSelect/SortSelect';
import { useSession } from 'next-auth/react';
import { Prompt, StoryAndNormalizedReplies } from 'src/interfaces/db';
import VirtualizedDataDisplay from '../VirtualizedDataDisplay';
import AccountDrawer from '../AccountDrawer';

const useStyles = createStyles((theme) => ({
    header: {
        width: '100%',
        borderBottom: '2px solid',
        borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
        color: theme.colorScheme === 'dark' ? 'white' : theme.colors.dark,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 15,
        transition: '0.5s ease-out',

        ['@media screen and (min-width: 900px)']: {
            width: '40%',
            left: '50%',
            right: '50%',
            transform: 'translateX(-50%)'
        }
    }
}));

interface Props {
    post?: IPost,
    postId: string
}
const CommentsContainer = ({ postId }: Props) => {

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = React.useState(false);

    const session = useSession();
    const queryClient = useQueryClient();

    const postInfo = useSelector((state: PostsState) => postSelector(state, postId))

    const storiesDownloaded = useSelector((state: PostsState) => state.stories[postId]);

    const { data: storiesData, isLoading, isFetching, isRefetching, isError, error } = trpc.useQuery(['story.forPost', { id: postId, userId: session.data?.user?.id }], {
        // onSuccess: (data) => console.log(data),
        initialData: () => {
            if (storiesDownloaded === undefined) {
                console.log("storiesDownloaded undefined")
                return;
            }
            return storiesDownloaded
        }
    });
    const { data: postData } = trpc.useQuery(['post.byId', { id: postId, userId: session.data?.user?.id }], {
        initialData: () => {
            if (postInfo === undefined) {
                console.log("Empty state")
                const queryCache = (queryClient.getQueryData(['post.sort']) as Prompt[]);
                if (queryCache !== undefined) {
                    const cacheInfo = queryCache.find((val) => val.id === postId);
                    if (cacheInfo) {
                        console.log("Cached post: ", cacheInfo)
                        return cacheInfo;
                    }
                }
                return
            }
            const { ...rest } = postInfo;
            return rest;
        }
    });
    const { classes } = useStyles();

    return (
        <Stack align='center'>
            <Stack spacing={0} sx={(theme) => ({ width: largeScreen ? '40%' : '100%', borderLeft: largeScreen ? '2px solid' : 'unset', borderRight: largeScreen ? '2px solid' : 'unset', borderColor: theme.colors.dark[4] })}>
                <Paper px='lg' py='xs' className={classes.header}>
                    <Group noWrap align='start' position='apart' sx={{ width: '100%' }}>
                        <MdKeyboardBackspace size={30} onClick={() => { router.back() }} />
                        <Avatar radius={'xl'} onClick={() => { setDrawerOpen(true) }} />
                        <AccountDrawer opened={drawerOpen} closeDrawer={() => setDrawerOpen(false)} />
                    </Group>
                </Paper>
                {/* Post Details */}
                {(postData) &&
                    <Box mt={60}>
                        <Post {...postData} totalComments={postData.totalComments} index={0} isDownloaded={postInfo?.downloaded} liked={postData.liked} />
                    </Box>
                }
                <Stack spacing={0} pb={40}>

                    <Group noWrap px='lg' py='xs' sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1] })}>
                        <SortSelect onChange={() => { }} />
                    </Group>
                    {
                        postData?.totalComments === 0 ?
                            <Center sx={{ height: '50vh' }}>
                                <Title order={2} sx={(theme) => ({ color: theme.colors.dark[3] })}>No Stories Yet</Title>
                            </Center>
                            :
                            <VirtualizedDataDisplay
                                dataInfo={{ error, isError, isFetching, isLoading, isRefetching, data: storiesData }}
                                renderItem={(item: StoryAndNormalizedReplies) => {
                                    return <CommentDisplay
                                        key={item.id}
                                        {...item}
                                        allReplies={item.replies}
                                        replies={[...Object.keys(item.replies).filter((val) => item.replies[val].replyId === null)]}
                                        postId={postId}
                                        postAuthor={postData?.author ?? ''}
                                        replyIndex={0}
                                        isDownloaded={postInfo?.downloaded}
                                        liked={postInfo?.liked}
                                        favorited={postInfo?.favorited}
                                        readLater={postInfo?.readLater}
                                    />;
                                }}
                            />

                    }
                </Stack>
            </Stack>
        </Stack>
    );

}

export default CommentsContainer;