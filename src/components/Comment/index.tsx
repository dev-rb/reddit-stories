import * as React from 'react';
import HtmlReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import { createStyles, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { MdBookmark } from 'react-icons/md';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { BsClockHistory } from 'react-icons/bs';
import useLongPress from '../../hooks/useLongPress';
import { Story } from '@prisma/client';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { ExtendedReply } from 'src/interfaces/reddit';
import { nestedColors } from 'src/utils/nestedColors';

dayjs.extend(RelativeTime);
const useCommentStyles = createStyles((theme, { liked, replyIndex }: { liked: boolean, replyIndex: number }) => ({
    rootContainer: {
        position: 'relative',
        marginLeft: replyIndex > 0 ? 8 : 0,
        ' > #parent-reply:nth-of-type(2)': {
            borderLeft: `2px solid ${theme.colors.blue[5]}`
        },
        borderLeft: replyIndex > 0 ? `1px solid ${theme.colors.dark[4]}` : 'unset'
    },
    commentContainer: {
        borderBottom: '1px solid',
        borderTop: '1px solid',
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
        [`#root-container > div:is(#parent-reply)`]: {
            borderLeft: `2px solid ${theme.colors[nestedColors[replyIndex] ?? 'indigo'][5]}`
        }
    }
}));

const CommentDisplay = ({ body, bodyHtml, author, created, id, score, replies, permalink, postId, postAuthor, replyIndex }: Story & { replies: ExtendedReply[], postAuthor: string, replyIndex: number }) => {
    const [liked, setLiked] = React.useState(false);
    const { classes } = useCommentStyles({ liked, replyIndex });

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
        <Stack id={'root-container'} className={classes.rootContainer} spacing={0}>
            <Stack id={"parent-reply"} className={classes.commentContainer} spacing={0} px='lg' py='xs' {...longPressEvent}>
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

                    <Group noWrap align='center' spacing={40}>
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
            {replies.length > 0 &&

                <Stack id={"replies-container"} className={classes.repliesContainer} spacing={0}>
                    {replies.map((reply, index) => {

                        return (
                            <CommentDisplay key={reply.id} {...reply} permalink={permalink} postId={postId} replies={reply.replies} replyIndex={replyIndex + 1} postAuthor={postAuthor} />
                        )
                    })}
                </Stack>
            }
        </Stack>
    );
}

export default CommentDisplay;