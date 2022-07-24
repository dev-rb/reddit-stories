import * as React from 'react';
import HtmlReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import { createStyles, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { MdBookmark } from 'react-icons/md';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { BsClockHistory } from 'react-icons/bs';
import useLongPress from '../../hooks/useLongPress';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { nestedColors } from 'src/utils/nestedColors';
import { ExtendedReply, IStory } from 'src/interfaces/db';
import PostControls from '../PostControls';

dayjs.extend(RelativeTime);
const useCommentStyles = createStyles((theme, { liked, replyIndex }: { liked: boolean, replyIndex: number }) => ({
    rootContainer: {
        position: 'relative',
        marginLeft: replyIndex > 0 && replyIndex < 12 ? 8 : 0,
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

const CommentDisplay = ({ body, bodyHtml, author, created, id, score, replies, permalink, postId, postAuthor, replyIndex, liked: storyLiked }: IStory & { replies: ExtendedReply[], postAuthor: string, replyIndex: number }) => {
    const [liked, setLiked] = React.useState(storyLiked ?? false);
    const { classes } = useCommentStyles({ liked, replyIndex });

    const commentRef = React.useRef<HTMLDivElement>(null);

    const minimizeComment = () => {
        console.log("Long press called")
        const comment = commentRef.current;

        if (comment) {
            comment.style.height = '40px';
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
    }, { delay: 1000, shouldPreventDefault: false });

    return (
        <Stack ref={commentRef} id={'root-container'} className={classes.rootContainer} spacing={0} {...longPressEvent}>
            <Stack id={"parent-reply"} className={classes.commentContainer} spacing={0} px='lg' py='xs'>
                <Group className={classes.commentDetails} noWrap spacing={4} align='center'>
                    <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>u/{author}</Title>
                    {postAuthor === author &&
                        <Text size='xs' color='blue'>OP</Text>
                    }
                    <Text size='lg'>·</Text>
                    <Text size='xs'>{(dayjs(created).fromNow())}</Text>
                </Group>
                <Stack spacing={0}>
                    <Text size='sm'> {HtmlReactParser(sanitize(bodyHtml, { transformTags: { 'a': 'p' } }))} </Text>

                    <PostControls liked={liked} postInfo={{ body, bodyHtml, author, created, id, score, postId, replies, totalComments: replies.length }} toggleLiked={() => setLiked((prev) => !prev)} />
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