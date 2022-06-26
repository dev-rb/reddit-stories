import * as React from 'react';
import styles from './comment.module.css';
import HtmlReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import { createStyles, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { MdBookmark, MdModeComment } from 'react-icons/md';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { BsClockHistory } from 'react-icons/bs';
import useLongPress from '../../hooks/useLongPress';
import { Reply, Story } from '@prisma/client';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import ReplyDisplay from '../ReplyDisplay'

dayjs.extend(RelativeTime);
const useCommentStyles = createStyles((theme, { liked }: { liked: boolean }) => ({
    rootContainer: {
        [`:nth-of-type(1)`]: {
            marginLeft: 80,
            borderLeft: '2px solid red'
        }
    },
    commentContainer: {
        borderBottom: '2px solid',
        borderTop: '2px solid',
        borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
        userSelect: 'none'
    },
    commentDetails: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5]
    },
    likeButton: {
        color: liked ? theme.colors.orange[4] : theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[6]
    },
    repliesContainer: {
        [`:nth-of-type(0)`]: {
            marginLeft: 80,
            borderLeft: '2px solid red'
        }
    }
}));

interface ExtendedReply extends Reply {
    replies: ExtendedReply[]
}

const CommentDisplay = ({ body, bodyHtml, author, created, id, score, replies, permalink, postId, postAuthor }: Story & { replies: Reply[], postAuthor: string }) => {
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

    const recursiveFind = (start: ExtendedReply, findId: string, lookingForOriginId: string): ExtendedReply | undefined => {
        if (start.id === findId) {
            return start;
        } else {
            for (let i = 0; i < start.replies.length; i++) {
                let val = start.replies[i];
                const found: ExtendedReply | undefined = recursiveFind(val, findId, lookingForOriginId);;
                if (found !== undefined) {
                    return found
                }
            }
        }
        return;
    }

    const getReplies = () => {
        let nestedReplies: ExtendedReply[] = [];
        replies.forEach((reply) => {
            if (reply.replyId === null) {
                const newReply: ExtendedReply = { ...reply, replies: [] }
                nestedReplies.push(newReply);
            } else if (reply.replyId !== null) {
                const newReply: ExtendedReply = { ...reply, replies: [] }
                nestedReplies.forEach((val) => {
                    let foundDeep = recursiveFind(val, newReply.replyId!, newReply.id);
                    if (foundDeep) {
                        foundDeep.replies.push(newReply);
                    }
                })
            }
        });

        return nestedReplies;
    }

    return (
        <Stack className={classes.rootContainer} spacing={0}>
            <Stack className={classes.commentContainer} spacing={0} px='lg' {...longPressEvent}>
                <Group className={classes.commentDetails} noWrap spacing={4} align='center'>
                    <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>u/{author}</Title>
                    {postAuthor === author &&
                        <Text size='xs' color='blue'>OP</Text>
                    }
                    <Text size='lg'>·</Text>
                    <Text size='xs'>{(dayjs(created).fromNow())}</Text>
                </Group>
                <Stack ref={commentRef} spacing={0}>
                    <Text size='sm'> {HtmlReactParser(sanitize(bodyHtml, { transformTags: { 'a': 'p' } }))} </Text>

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
            <Stack className={classes.repliesContainer} spacing={0}>
                {getReplies().map((reply, index) => <ReplyDisplay key={reply.id} {...reply} replyIndex={0} postAuthor={postAuthor} />)}
            </Stack>
        </Stack>
    );
}

export default CommentDisplay;