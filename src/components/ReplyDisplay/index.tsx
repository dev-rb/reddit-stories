import React from 'react';
import HtmlReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import { createStyles, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { MdBookmark, MdModeComment } from 'react-icons/md';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { BsClockHistory } from 'react-icons/bs';
import { Reply, Story } from '@prisma/client';
import { nestedColors } from '../../utils/nestedColors';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(RelativeTime);
const useCommentStyles = createStyles((theme, { liked, replyIndex }: { liked: boolean, replyIndex: number }) => ({
    rootContainer: {
        position: 'relative',
        marginLeft: 8,
        ' > #parent-reply:first-child': {
            borderLeft: `2px solid ${theme.colors.blue[5]}`
        },
    },
    commentContainer: {
        borderBottom: `2px solid ${theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]}`,
        // border: '2px solid',
        // borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
        userSelect: 'none',
    },
    commentDetails: {
        color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5]
    },
    likeButton: {
        color: liked ? theme.colors.orange[4] : theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[6]
    },
    repliesContainer: {
        [`#root-container > div:is(#parent-reply)`]: {
            borderLeft: `2px solid ${theme.colors[nestedColors[replyIndex] ?? 'indigo'][5]} !important`
        }
    }
}));

interface ExtendedReply extends Reply {
    replies: ExtendedReply[],
}

const ReplyDisplay = ({ body, bodyHtml, author, created, id, score, replies, replyIndex }: ExtendedReply & { replyIndex: number }) => {
    const [liked, setLiked] = React.useState(false);

    const { classes } = useCommentStyles({ liked, replyIndex });

    return (
        <Stack id={'root-container'} className={classes.rootContainer} spacing={0}>
            <Stack id={"parent-reply"} className={classes.commentContainer} spacing={0} px='lg' py='xs'>
                <Group className={classes.commentDetails} noWrap spacing={4} align='center'>
                    <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>u/{author}</Title>
                    <Text size='lg'>·</Text>
                    <Text size='xs'>{(dayjs(created).fromNow())}</Text>
                </Group>
                <Stack spacing={0}>
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
                            <ReplyDisplay key={reply.id} {...reply} replyIndex={replyIndex + 1} />
                        )
                    })}
                </Stack>
            }
        </Stack>
    )
}

export default ReplyDisplay;