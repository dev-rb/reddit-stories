import * as React from 'react';
import HtmlReactParser from 'html-react-parser';
import sanitize from 'sanitize-html';
import { ActionIcon, Collapse, Group, Stack, Text, Title } from '@mantine/core';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs';
import dayjs from 'dayjs';
import RelativeTime from 'dayjs/plugin/relativeTime';
import { Comments, IStory } from 'src/types/db';
import PostInteractions from '../PostInteractions';
import { useSelector } from 'react-redux';
import { getCommentStatuses, PostsState } from 'src/redux/slices';
import { useCommentStyles } from './comment.styles';
import { PostStatus } from 'src/server/routers/post';
import { StatusIndicators } from '../StatusIndicators';

dayjs.extend(RelativeTime);

interface CommentStatuses {
  downloaded: boolean;
  liked: boolean;
  favorited: boolean;
  readLater: boolean;
}

interface CommentProps extends IStory {
  allReplies: Comments;
  replies: string[];
  postAuthor: string;
  replyIndex: number;
  isCollapsed: boolean;
  isDownloaded?: boolean;
  collapseComment: (id: string) => void;
}

const Comment = ({
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
  favorited: storyFavorited,
  readLater: storyReadLater,
  isCollapsed,
  isDownloaded,
  repliesTotal,
  collapseComment,
}: CommentProps) => {
  const commentStatus = useSelector((state: PostsState) => getCommentStatuses(state, postId!, id));

  const [{ downloaded, favorited, liked, readLater }, setCommentStatus] = React.useState<CommentStatuses>({
    downloaded: isDownloaded ?? commentStatus?.downloaded ?? false,
    liked: storyLiked ?? commentStatus?.liked ?? false,
    favorited: storyFavorited ?? commentStatus?.favorited ?? false,
    readLater: storyReadLater ?? commentStatus?.readLater ?? false,
  });

  const [collapsedState, setCollapsedState] = React.useState<Record<string, boolean>>(
    replies.reduce((acc, id) => {
      acc[id] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const { classes } = useCommentStyles({ liked, replyIndex, collapsed: isCollapsed ?? false });

  const commentRef = React.useRef<HTMLDivElement>(null);

  const getCommentReplies = () => {
    if (replies.length === 0) {
      return;
    }
    const mapOfReplies = replies.map((val) => allReplies[val]);

    return mapOfReplies;
  };

  const collapseSelf = () => {
    collapseComment(id);
  };

  const collapseReply = React.useCallback(
    (id: string) => {
      setCollapsedState((p) => ({ ...p, [id]: !p[id] }));
    },
    [id]
  );

  const toggleStatus = (status: PostStatus) => {
    setCommentStatus((p) => ({ ...p, [status]: !p[status] }));
  };

  React.useEffect(() => {
    if (isDownloaded !== undefined) {
      setCommentStatus((p) => ({ ...p, downloaded: isDownloaded }));
    }
  }, [isDownloaded]);

  return (
    <Stack ref={commentRef} id={'root-container'} className={classes.rootContainer} spacing={0}>
      <Stack id={'parent-reply'} className={classes.commentContainer} spacing={0} px="lg" py="xs">
        <Group align="center" position="apart">
          <Group className={classes.commentDetails} noWrap spacing={4} align="center">
            {isCollapsed !== undefined && (
              <ActionIcon variant="filled" size="md" radius={'xl'} mr="sm" onClick={collapseSelf}>
                {isCollapsed ? <BsChevronUp /> : <BsChevronDown />}
              </ActionIcon>
            )}
            <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>
              u/{author}
            </Title>
            {postAuthor === author && (
              <Text size="xs" color="blue">
                OP
              </Text>
            )}
            <Text size="lg">·</Text>
            <Text size="xs">{dayjs(created).fromNow()}</Text>
          </Group>
          <StatusIndicators downloaded={downloaded} readLater={readLater} favorited={favorited} />
        </Group>
        <Collapse in={!isCollapsed} animateOpacity transitionTimingFunction="ease-out">
          <Stack spacing={0}>
            <Text size="sm">{HtmlReactParser(sanitize(bodyHtml, { transformTags: { a: 'p' } }))}</Text>

            <PostInteractions
              postInfo={{ id, score, postId, replies, liked, mainCommentId, repliesTotal }}
              liked={liked}
              favorited={favorited}
              readLater={readLater}
              toggleStatus={toggleStatus}
            />
          </Stack>
        </Collapse>
      </Stack>
      <Collapse in={!isCollapsed}>
        {replies !== undefined && (
          <Stack id={'replies-container'} className={classes.repliesContainer} spacing={0}>
            {getCommentReplies()?.map((reply) => {
              return (
                <Comment
                  key={reply.id}
                  {...reply}
                  permalink={permalink}
                  postId={postId}
                  allReplies={allReplies}
                  replyIndex={replyIndex + 1}
                  postAuthor={postAuthor}
                  isCollapsed={collapsedState[reply.id]}
                  collapseComment={collapseReply}
                />
              );
            })}
          </Stack>
        )}
      </Collapse>
    </Stack>
  );
};

export default React.memo(Comment, (p, n) => {
  const sameId = p.id === n.id;
  const sameCollapse = n.isCollapsed === p.isCollapsed;
  return sameId && sameCollapse ? true : false;
});
