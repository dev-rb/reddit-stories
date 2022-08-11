import * as React from 'react';
import HtmlReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import { ActionIcon, Group, Stack, Text, Title, useMantineTheme } from '@mantine/core';
import { MdBookmark, MdFileDownload } from 'react-icons/md';
import { BsChevronDown, BsChevronUp, BsClockFill } from 'react-icons/bs';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { IStory, NormalizedReplies } from 'src/interfaces/db';
import PostControls from '../PostControls';
import { ListVirtualizerContext } from 'src/utils/contexts/ListVirtualizerContext';
import { useSelector } from 'react-redux';
import { getCommentStatuses, PostsState } from 'src/redux/slices';
import { useCommentStyles } from './comment.styles';

dayjs.extend(RelativeTime);

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
    favorited: storySaved,
    readLater: storyReadLater,
    isCollapsed,
    isDownloaded
}: CommentDisplayProps) => {
    const commentStatus = useSelector((state: PostsState) => getCommentStatuses(state, postId!, id));

    const [liked, setLiked] = React.useState(storyLiked ?? commentStatus?.liked ?? false);
    const [saved, setSaved] = React.useState(storySaved ?? commentStatus?.favorited ?? false);
    const [later, setLater] = React.useState(storyReadLater ?? commentStatus?.readLater ?? false);

    const [downloadedStatus, setDownloadedStatus] = React.useState(commentStatus?.downloaded ?? false);

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

    React.useEffect(() => {
        if (isDownloaded !== undefined) {
            setDownloadedStatus(isDownloaded)
        }
    }, [isDownloaded])

    return (
        <Stack ref={commentRef} id={'root-container'} className={classes.rootContainer} spacing={0}>
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
                        {/* <Text size='lg'>·</Text>
                        <Text size='lg'>{replyIndex}</Text> */}
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
                                favorited={reply.favorited}
                            />
                        )
                    })}
                </Stack>
            }

        </Stack>
    );
}

export default CommentDisplay;