import * as React from 'react';
import styles from './comment.module.css';
import HtmlReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import { createStyles, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { MdBookmark, MdModeComment } from 'react-icons/md';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { BsClockHistory } from 'react-icons/bs';
import useLongPress from '../../hooks/useLongPress';

const useCommentStyles = createStyles((theme, { liked }: { liked: boolean }) => ({
    commentContainer: {
        borderBottom: '2px solid',
        borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
        userSelect: 'none'
    },
    commentDetails: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5]
    },
    likeButton: {
        color: liked ? theme.colors.orange[4] : theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[6]
    }
}));

interface Props {
    body: string,
    body_html: string,
    author: string,
    id: string,
    created: number,
    score: number
}

const CommentDisplay = ({ body, body_html, author, created, id, score }: Props) => {
    const [liked, setLiked] = React.useState(false);

    const { classes } = useCommentStyles({ liked });

    const commentRef = React.useRef<HTMLDivElement>(null);

    const minimizeComment = () => {
        console.log("Long press called")
        const comment = commentRef.current;

        if (comment) {
            comment.style.height = '10px';
            comment.style.overflow = 'hidden'
        }
    }

    const expandComment = () => {
        const comment = commentRef.current;

        if (comment) {
            comment.style.height = '100%';
            comment.style.overflow = 'unset'
        }
    }

    const longPressEvent = useLongPress<HTMLDivElement>({
        onLongPress: minimizeComment,
        onClick: expandComment
    }, { delay: 1000 });

    return (
        <Stack className={classes.commentContainer} spacing={0} px='lg' {...longPressEvent}>
            <Group className={classes.commentDetails} noWrap spacing={4} align='center'>
                <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>u/{author}</Title>
                <Text size='lg'>·</Text>
                <Text size='xs'>{(new Date(created * 1000).toLocaleString('en-US'))}</Text>
            </Group>
            <Stack ref={commentRef} spacing={0}>
                <Text size='sm'> {HtmlReactParser(sanitize(body_html, { transformTags: { 'a': 'p' } }))} </Text>

                <Group noWrap align='center' my='md' spacing={40}>
                    <UnstyledButton
                        className={classes.likeButton}
                        onTouchStart={(e: React.TouchEvent<HTMLButtonElement>) => { e.stopPropagation(); }}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); e.preventDefault(); console.log("Liked!"); setLiked((prev) => !prev); }}
                    >
                        <Group noWrap align='center' spacing={4}>
                            {
                                liked ?
                                    <HiHeart size={20} /> :
                                    <HiOutlineHeart size={20} />
                            }
                            <Text weight={500}>{score}</Text>
                        </Group>
                    </UnstyledButton>

                    <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[6] })}>
                        <MdBookmark size={20} />
                    </UnstyledButton>
                    <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[6] })}>
                        <BsClockHistory size={20} />
                    </UnstyledButton>
                </Group>
            </Stack>

        </Stack>
    );
}

export default CommentDisplay;