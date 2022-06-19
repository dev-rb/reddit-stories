import * as React from 'react';
import { CommentDetails, IPost, Posts } from '../../interfaces/reddit';
import { MdArrowDropDown, MdKeyboardBackspace } from 'react-icons/md';
import CommentDisplay from '../Comment';
import styles from './commentsContainer.module.css';
import useFixedNavbar from '../../hooks/useFixedNavbar';
import { useGetCommentsForPostQuery } from '../../redux/services';
import { formatStoriesData } from '../../helpers/cleanData';
import { useNavigate, useParams } from 'react-router-dom';
import { createStyles, Group, NativeSelect, Paper, Stack } from '@mantine/core';
import Post from '../Post';
import { useRouter } from 'next/router';

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
    const [stories, setStories] = React.useState<CommentDetails[]>();
    const router = useRouter();

    const { data } = useGetCommentsForPostQuery(postId!);

    const { classes } = useStyles();

    useFixedNavbar(headerRef, true);

    React.useEffect(() => {
        if (data) {
            // console.log(data)
            setStories(data);
        }
    }, [data])

    return (
        <Stack >
            <Paper ref={headerRef} px='lg' py='xs' className={classes.header}>
                <MdKeyboardBackspace size={30} onClick={() => { router.back() }} />
            </Paper>
            {/* Post Details */}

            <Stack mt={60}>
                <Group noWrap px='lg' py='xs' sx={(theme) => ({ backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1] })}>
                    <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} />
                </Group>
                {stories?.map((story) => {
                    return <CommentDisplay key={story.id} body={story.body} body_html={story.body_html} author={story.author} created={story.created} id={story.id} score={story.score} />
                })}
            </Stack>
        </Stack>
    );

}

export default CommentsContainer;