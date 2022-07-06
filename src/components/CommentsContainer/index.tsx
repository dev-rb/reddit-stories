import * as React from 'react';
import { IPost } from '../../interfaces/reddit';
import { MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import useFixedNavbar from '../../hooks/useFixedNavbar';
import { createStyles, Group, Paper, Stack, Box, Title, Center } from '@mantine/core';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { Story } from '@prisma/client';
import Post from '../Post';
import { useMediaQuery } from '@mantine/hooks';
import SortSelect from '../SortSelect';
import { useQueryClient } from 'react-query';
import { PromptAndStoriesWithReplies, Prompt } from 'src/interfaces/db';

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
    const [stories, setStories] = React.useState<Story[]>();
    const router = useRouter();

    const queryClient = useQueryClient();

    const { data } = trpc.useQuery(['story.forPost', { id: postId }], {
        initialData: () => {
            console.log("Inital Data for post stories called")
            return (queryClient.getQueryData(['post.sort']) as (PromptAndStoriesWithReplies[]))?.find((val) => val.id === postId)?.stories
        }
    });
    const { data: postData } = trpc.useQuery(['post.byId', { id: postId }], {
        initialData: () => {
            return (queryClient.getQueryData(['post.sort']) as (PromptAndStoriesWithReplies[]))?.find((val) => val.id === postId)
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
                {(postData && data) &&
                    <Box mt={60}>
                        <Post totalStories={data.length} id={postData.id} title={postData.title} created={postData.created} updatedAt={null} score={postData.score} author={postData.author} permalink={postData.permalink} index={0} />
                    </Box>
                }
                <Stack spacing={0} pb={40}>

                    <Group noWrap px='lg' py='xs' sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1] })}>
                        <SortSelect />
                        {/* <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} /> */}
                    </Group>
                    {
                        data?.length === 0 ?
                            <Center sx={{ height: '50vh' }}>
                                <Title order={2} sx={(theme) => ({ color: theme.colors.dark[3] })}>No Stories Yet</Title>
                            </Center>
                            :
                            data?.map((story) => {
                                return <CommentDisplay key={story.id} {...story} postId={postId} updatedAt={null} postAuthor={'postData!.author'} replyIndex={0} />
                            })
                    }
                </Stack>
            </Stack>
        </Stack>
    );

}

export default CommentsContainer;