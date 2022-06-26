import * as React from 'react';
import { CommentDetails, IPost } from '../../interfaces/reddit';
import { MdArrowDropDown, MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import useFixedNavbar from '../../hooks/useFixedNavbar';
import { useGetCommentsForPostQuery } from '../../redux/services';
import { createStyles, Group, NativeSelect, Paper, Stack, Box } from '@mantine/core';
import { useRouter } from 'next/router';
import { trpc } from '../../utils/trpc';
import { Story } from '@prisma/client';
import Post from '../Post';

const useStyles = createStyles((theme) => ({
    header: {
        width: '100vw',
        borderBottom: '2px solid',
        borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
        color: theme.colorScheme === 'dark' ? 'white' : theme.colors.dark,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 15,
        transition: '0.5s ease-out'
    }
}));

interface Props {
    post?: IPost,
    postId: string
}
const CommentsContainer = ({ postId }: Props) => {

    const headerRef = React.useRef(null);
    const [stories, setStories] = React.useState<Story[]>();
    const router = useRouter();

    const { data } = trpc.useQuery(['story.all', { postId }]);
    const { data: postData } = trpc.useQuery(['post.byId', { id: postId }]);

    // const { data } = useGetCommentsForPostQuery(postId!);

    const { classes } = useStyles();

    useFixedNavbar(headerRef, true);

    React.useEffect(() => {
        if (data) {
            console.log(data)
            // setStories(data);
        }
    }, [data])

    return (
        <Stack spacing={0}>
            <Paper ref={headerRef} px='lg' py='xs' className={classes.header}>
                <MdKeyboardBackspace size={30} onClick={() => { router.back() }} />
            </Paper>
            {/* Post Details */}
            {postData &&
                <Box mt={60}>
                    <Post totalStories={postData!.stories.length} id={postData.id} title={postData.title} created={postData.created} updatedAt={null} score={postData.score} author={postData.author} permalink={postData.permalink} />
                </Box>
            }
            <Stack>
                <Group noWrap px='lg' py='xs' sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1] })}>
                    <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} />
                </Group>
                {data?.map((story) => {
                    return <CommentDisplay key={story.id} {...story} postId={postId} updatedAt={null} />
                })}
            </Stack>
        </Stack>
    );

}

export default CommentsContainer;