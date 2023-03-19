import * as React from 'react';
import { Group, UnstyledButton, Text } from '@mantine/core';
import { BsClockFill } from 'react-icons/bs';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { MdModeComment, MdBookmark } from 'react-icons/md';
import { Comments, IStory, Prompt } from 'src/types/db';
import { trpc } from 'src/utils/trpc';
import { useUser } from 'src/hooks/useUser';
import { useDispatch } from 'react-redux';
import { updatePostStatus, updateCommentStatus } from 'src/redux/slices';
import { PostStatus } from 'src/server/routers/post';
import { showPostStatusNotification, showUnauthenticatedNotification } from 'src/utils/notifications';
import { useQueryClient } from 'react-query';
import { useInteractionStyles } from './interactions.styles';

type NeededPromptValues = Pick<Prompt, 'id' | 'liked' | 'score' | 'totalComments'>;
type NeededStoryValues = Pick<IStory, 'liked' | 'score' | 'id' | 'postId' | 'repliesTotal'> & {
  mainCommentId: string | null;
  replies: string[];
};
type PostOrComment = NeededPromptValues | NeededStoryValues;

interface PostInteractionsProps<TData extends PostOrComment> {
  postInfo: TData;
  liked: boolean;
  favorited: boolean;
  readLater: boolean;
  toggleStatus: (status: PostStatus) => void;
}

const PostInteractions = <TData extends PostOrComment>({
  postInfo,
  liked,
  favorited,
  readLater,
  toggleStatus,
}: PostInteractionsProps<TData>) => {
  const { mutate: updatePostMutation } = trpc.useMutation('post.updatePostStatus', {
    onMutate(variables) {
      const queryKey = ['user.getLikes', { userId, status: variables.status }];
      queryClient.setQueryData(queryKey, (cache: Prompt[] | undefined) => {
        if (!cache) return [];

        const rootComment = cache.find((v) => v.id === variables.postId);

        if (rootComment) {
          rootComment[variables.status] = variables.newValue;
        }

        return [...cache];
      });

      if (isStory) return;
      const previousInfo = queryClient.getQueryData(['post.sort']);
      queryClient.setQueryData(['post.sort'], (cache: Prompt[] | undefined) => {
        if (!cache) return [];

        const rootComment = cache.find((v) => v.id === variables.postId);

        if (rootComment) {
          rootComment[variables.status] = variables.newValue;
        }

        return [...cache];
      });

      return previousInfo;
    },
  });
  const queryClient = useQueryClient();

  const { mutate: updateStoryMutation } = trpc.useMutation('story.updateCommentStatus', {
    onMutate(variables) {
      if (!isStory) return;
      const previousStories = queryClient.getQueryData([
        'story.forPost',
        { id: postInfo.postId, userId: variables.userId },
      ]);
      queryClient.setQueryData(
        ['story.forPost', { id: postInfo.postId, userId: variables.userId }],
        (cache: Comments | undefined) => {
          if (!cache) return {};

          const rootComment = Object.values(cache).find((v) => v.id === variables.commentId);

          if (rootComment) {
            rootComment[variables.status] = variables.newValue;
          }
          return { ...cache };
        }
      );

      return previousStories;
    },
  });

  const { userId, isAuthenticated } = useUser();
  const { classes } = useInteractionStyles({ liked });

  const dispatch = useDispatch();

  const isStory = 'replies' in postInfo;

  const updateLocalState = (status: PostStatus, newValue: boolean) => {
    if (isStory) {
      dispatch(
        updateCommentStatus({
          postId: postInfo.postId!,
          commentId: postInfo.id,
          newStatusValue: newValue,
          statusToUpdate: status,
        })
      );
    } else {
      dispatch(
        updatePostStatus({
          postId: postInfo.id!,
          newStatusValue: newValue,
          statusToUpdate: status,
        })
      );
    }
  };

  const updatePost = (status: PostStatus) => {
    if (!isAuthenticated) {
      showUnauthenticatedNotification();
      return;
    }
    let newValue = false;
    switch (status) {
      case 'liked':
        newValue = liked;
        break;
      case 'favorited':
        newValue = favorited;
        break;
      case 'readLater':
        newValue = readLater;
        break;
    }
    toggleStatus(status);
    if (isStory) {
      updateStoryMutation({
        commentId: postInfo.id,
        userId: userId!,
        status,
        newValue: !newValue,
      });
    } else {
      updatePostMutation({
        postId: postInfo.id,
        userId: userId!,
        status,
        newValue: !newValue,
      });
    }

    showPostStatusNotification(status, !newValue);
    updateLocalState(status, !newValue);
  };

  const handleActionPress = (e: React.MouseEvent<HTMLButtonElement>, status: PostStatus) => {
    e.stopPropagation();
    e.preventDefault();
    updatePost(status);
  };

  return (
    <Group noWrap align="center" spacing={40}>
      <UnstyledButton
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleActionPress(e, 'liked')}
        className={`${classes.baseInteraction} ${classes.like}`}
      >
        <Group noWrap align="center" spacing={4}>
          {liked ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />}
          <Text weight={500}>{postInfo.score}</Text>
        </Group>
      </UnstyledButton>
      <UnstyledButton className={classes.baseInteraction}>
        <Group noWrap align="center" spacing={4}>
          <MdModeComment size={20} />
          <Text weight={500}>{isStory ? postInfo.repliesTotal : (postInfo as any).totalComments}</Text>
        </Group>
      </UnstyledButton>
      <UnstyledButton
        className={classes.baseInteraction}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleActionPress(e, 'favorited')}
      >
        <MdBookmark size={20} />
      </UnstyledButton>
      <UnstyledButton
        className={classes.baseInteraction}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleActionPress(e, 'readLater')}
      >
        <BsClockFill size={20} />
      </UnstyledButton>
    </Group>
  );
};

export default PostInteractions;
