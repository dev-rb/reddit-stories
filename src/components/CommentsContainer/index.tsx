import * as React from 'react';
import { IPost } from '../../interfaces/reddit';
import { MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import useFixedNavbar from '../../hooks/useFixedNavbar';
import { createStyles, Group, Paper, Stack, Box, Title, Center } from '@mantine/core';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import Post from '../Post';
import { useMediaQuery } from '@mantine/hooks';
import MobileSelect from '../MobileSelect';
import { useQueryClient } from 'react-query';
import ListVirtualizer from '../ListVirtualizer';
import { useSelector } from 'react-redux';
import { postSelector, PostsState } from 'src/redux/slices';
import SortSelect from '../MobileSelect/SortSelect';
import { useSession } from 'next-auth/react';

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
            width: '40vw',
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

    const headerRef = React.useRef(null);
    const router = useRouter();

    const session = useSession();

    const postInfo = useSelector((state: PostsState) => postSelector(state, postId))

    const { data: storiesData } = trpc.useQuery(['story.forPost', { id: postId, userId: session.data?.user?.id }], {
        // onSuccess: (data) => console.log(data),
        initialData: () => {
            if (postInfo === undefined) {
                return;
            }
            return postInfo.stories
        }
    });
    const { data: postData } = trpc.useQuery(['post.byId', { id: postId, userId: session.data?.user?.id }], {
        initialData: () => {
            if (postInfo === undefined) {
                console.log("Empty state")
                return
            }
            const { downloaded, isReadLater, isSaved, ...rest } = postInfo;
            return rest;
        }
    });
    const { classes } = useStyles();
    useFixedNavbar(headerRef, true);

    return (
        <Stack align='center'>
            <Stack spacing={0} sx={(theme) => ({ width: largeScreen ? '40vw' : '100%', borderLeft: largeScreen ? '2px solid' : 'unset', borderRight: largeScreen ? '2px solid' : 'unset', borderColor: theme.colors.dark[4] })}>
                <Paper ref={headerRef} px='lg' py='xs' className={classes.header}>
                    <MdKeyboardBackspace size={30} onClick={() => { router.back() }} />
                </Paper>
                {/* Post Details */}
                {(postData) &&
                    <Box mt={60}>
                        <Post {...postData} index={0} />
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
                            <ListVirtualizer
                                data={storiesData ?? []}
                                renderItem={(item) => {
                                    const currentItem = storiesData![item.index]
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
                                            <CommentDisplay
                                                key={currentItem.id}
                                                {...currentItem}
                                                postId={postId}
                                                postAuthor={postData!.author}
                                                replyIndex={0} />
                                        </div>
                                    )
                                }}

                            />

                    }
                </Stack>
            </Stack>
        </Stack>
    );

}

export default CommentsContainer;