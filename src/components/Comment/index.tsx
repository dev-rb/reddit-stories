import * as React from 'react';
import HtmlReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import { ActionIcon, Button, createStyles, Group, Stack, Text, Title, UnstyledButton, useMantineTheme } from '@mantine/core';
import { MdBookmark, MdFileDownload } from 'react-icons/md';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { BsChevronDown, BsChevronUp, BsClockFill, BsClockHistory, BsMenuDown } from 'react-icons/bs';
import useLongPress from '../../hooks/useLongPress';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { nestedColors } from 'src/utils/nestedColors';
import { ExtendedReply, IStory, NormalizedReplies, StoryAndNormalizedReplies } from 'src/interfaces/db';
import PostControls from '../PostControls';
import { ListVirtualizerContext } from 'src/utils/contexts/ListVirtualizerContext';
import { useSelector } from 'react-redux';
import { commentDownloadStatus, PostsState } from 'src/redux/slices';

dayjs.extend(RelativeTime);
const useCommentStyles = createStyles((theme, { liked, replyIndex, collapsed }: { liked: boolean, replyIndex: number, collapsed: boolean }) => ({
    rootContainer: {
        position: 'relative',
        marginLeft: replyIndex > 0 && replyIndex < 12 ? 8 : 0,
        borderLeft: replyIndex > 0 ? `1px solid ${theme.colors.dark[4]}` : 'unset',
        height: collapsed ? 100 : 'unset',
        overflow: collapsed ? 'hidden' : 'unset'
    },
    commentContainer: {
        borderBottom: '1px solid',
        borderTop: '1px solid',
        borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4],
        userSelect: 'none',
        height: collapsed ? 100 : 'unset',
        overflow: collapsed ? 'hidden' : 'unset'
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
    },
    collapsedReadButton: {
        height: 60,
        position: 'absolute',
        bottom: 0,
        background: `linear-gradient(transparent 10%, ${theme.colors.dark[theme.colorScheme === 'dark' ? 9 : 0]})`,
        width: '100%',
        zIndex: 99
    }
}));

interface CommentDisplayProps extends IStory {
    allReplies: NormalizedReplies,
    replies: string[],
    postAuthor: string,
    replyIndex: number,
    isCollapsed?: boolean,
    isDownloaded?: boolean
}

const CommentDisplay = ({
    body,
    bodyHtml,
    author,
    created,
    id,
    mainCommentId,
    score,
    allReplies,
    replies,
    permalink,
    postId,
    postAuthor,
    replyIndex,
    liked: storyLiked,
    saved: storySaved,
    readLater: storyReadLater,
    isCollapsed,
    isDownloaded
}: CommentDisplayProps) => {
    const [liked, setLiked] = React.useState(storyLiked ?? false);
    const [saved, setSaved] = React.useState(storySaved ?? false);
    const [later, setLater] = React.useState(storyReadLater ?? false);

    const downloadStatusSelector = useSelector((state: PostsState) => commentDownloadStatus(state, postId!, id));

    const [downloadedStatus, setDownloadedStatus] = React.useState(downloadStatusSelector ?? false);

    const [collapsed, setCollapsed] = React.useState(isCollapsed ?? false);

    const listContext = React.useContext(ListVirtualizerContext);

    const { classes } = useCommentStyles({ liked, replyIndex, collapsed });

    const commentRef = React.useRef<HTMLDivElement>(null);

    const theme = useMantineTheme();

    const getCommentReplies = () => {
        if (replies.length === 0) {
            return;
        }
        const mapOfReplies = replies.map((val) => allReplies[val]);

        return mapOfReplies;
    }

    const collapseComment = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setCollapsed(!collapsed);
        listContext?.remeasure();
    }

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

    React.useEffect(() => {
        if (isDownloaded !== undefined) {
            setDownloadedStatus(isDownloaded)
        }
    }, [isDownloaded])

    return (
        <Stack ref={commentRef} id={'root-container'} className={classes.rootContainer} spacing={0} {...longPressEvent}>
            <Stack id={"parent-reply"} className={classes.commentContainer} spacing={0} px='lg' py='xs'>
                <Group align='center' position='apart'>
                    <Group className={classes.commentDetails} noWrap spacing={4} align='center'>
                        {isCollapsed !== undefined &&
                            <ActionIcon variant='filled' size='md' radius={'xl'} mr='sm' onClick={collapseComment}>
                                {collapsed ? <BsChevronUp /> : <BsChevronDown />}
                            </ActionIcon>
                        }
                        <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>u/{author}</Title>
                        {postAuthor === author &&
                            <Text size='xs' color='blue'>OP</Text>
                        }
                        <Text size='lg'>·</Text>
                        <Text size='xs'>{(dayjs(created).fromNow())}</Text>
                    </Group>
                    <Group noWrap spacing={10}>
                        <MdFileDownload size={16} color={downloadedStatus ? '#F84B30' : theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]} />
                        <BsClockFill size={16} color={later ? '#F8A130' : theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]} />
                        <MdBookmark size={16} color={saved ? '#30CFF8' : theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]} />
                    </Group>
                </Group>
                <Stack spacing={0}>
                    <Text size='sm'> {HtmlReactParser(sanitize(bodyHtml, { transformTags: { 'a': 'p' } }))} </Text>

                    <PostControls<Pick<IStory, 'liked' | 'score' | 'id' | 'postId'> & { mainCommentId: string | null, replies: string[] }>
                        postInfo={{ id, score, postId, replies, liked, mainCommentId }}
                        liked={liked}
                        toggleLiked={() => setLiked((prev) => !prev)}
                        favorited={saved}
                        toggleSaved={() => setSaved((prev) => !prev)}
                        readLater={later}
                        toggleReadLater={() => setLater((prev) => !prev)}
                    />
                </Stack>


            </Stack>
            {(replies !== undefined) &&

                <Stack id={"replies-container"} className={classes.repliesContainer} spacing={0}>
                    {getCommentReplies()?.map((reply, index) => {
                        return (
                            <CommentDisplay
                                key={reply.id}
                                {...reply}
                                permalink={permalink}
                                postId={postId}
                                allReplies={allReplies}
                                replies={reply.replies}
                                replyIndex={replyIndex + 1}
                                postAuthor={postAuthor}
                                liked={reply.liked}
                                readLater={reply.readLater}
                                saved={reply.saved}
                            />
                        )
                    })}
                </Stack>
            }
            {collapsed &&
                <Group className={classes.collapsedReadButton} align='center' position='center'>
                    <Button sx={{ backgroundColor: theme.colors.blue[9] }} onClick={collapseComment}> Read </Button>
                </Group>
            }
        </Stack>
    );
}

export default CommentDisplay;