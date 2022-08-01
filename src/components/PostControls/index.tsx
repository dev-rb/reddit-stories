import * as React from 'react';
import { Group, UnstyledButton, Text } from '@mantine/core';
import { BsClockFill } from 'react-icons/bs';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { MdModeComment, MdBookmark } from 'react-icons/md';
import { IStory, Prompt } from 'src/interfaces/db';
import { trpc } from 'src/utils/trpc';
import { useUser } from 'src/hooks/useUser';
import { useDispatch } from 'react-redux';
import { updatePostStatus, updateReplyStatus, updateStoryStatus } from 'src/redux/slices';
import { useQueryClient } from 'react-query';
import { PostStatus } from 'src/server/routers/post';
import { showPostStatusNotification, showUnauthenticatedNotification } from 'src/utils/notifications';

type NeededPromptValues = Pick<Prompt, 'id' | 'liked' | 'score' | 'totalComments'>
type NeededStoryValues = Pick<IStory, 'liked' | 'score' | 'id' | 'postId'> & { mainCommentId: string | null, replies: string[] }
type PostOrComment = NeededPromptValues | NeededStoryValues

interface PostControlsProps<TData extends PostOrComment> {
    postInfo: TData,
    liked: boolean,
    favorited: boolean,
    readLater: boolean,
    toggleLiked: () => void,
    toggleSaved: () => void,
    toggleReadLater: () => void,
}

const PostControls = <TData extends PostOrComment,>({ postInfo, liked, favorited, readLater, toggleLiked, toggleSaved, toggleReadLater }: PostControlsProps<TData>) => {

    const queryClient = useQueryClient();

    const { mutate: updatePostMutation } = trpc.useMutation('post.updatePostStatus');

    const { mutate: updateStoryMutation } = trpc.useMutation('story.updatePostStatus');

    const { userId, isAuthenticated } = useUser();

    const dispatch = useDispatch();

    const isStory = "replies" in postInfo;

    const updateLocalState = (status: PostStatus, newValue: boolean) => {
        if (isStory) {
            if (postInfo.mainCommentId === null) {
                dispatch(updateStoryStatus({ postId: postInfo.postId!, storyId: postInfo.id, newStatusValue: newValue, statusToUpdate: status }))
            } else {
                dispatch(updateReplyStatus({ postId: postInfo.postId!, storyId: postInfo.mainCommentId!, replyId: postInfo.id, newStatusValue: newValue, statusToUpdate: status }))
            }
        } else {
            dispatch(updatePostStatus({ postId: postInfo.id!, newStatusValue: newValue, statusToUpdate: status }))
        }
    }

    const updatePost = (status: PostStatus) => {
        if (!isAuthenticated) {
            showUnauthenticatedNotification();
            return;
        }
        showPostStatusNotification(status);
        let newValue = false;
        switch (status) {
            case 'liked':
                toggleLiked();
                newValue = liked;
                break;
            case 'favorited':
                toggleSaved();
                newValue = favorited;
                break;
            case 'readLater':
                toggleReadLater();
                newValue = readLater;
                break;
        }
        if (isStory) {
            console.log("Is story")
            updateStoryMutation({ commentId: postInfo.id, userId: userId!, status, newValue: !newValue })
        } else {

            console.log("Is prompt")
            updatePostMutation({ postId: postInfo.id, userId: userId!, status, newValue: !newValue })
        }

        updateLocalState(status, newValue);
    }

    const handleActionPress = (e: React.MouseEvent<HTMLButtonElement>, status: PostStatus) => {
        e.stopPropagation();
        e.preventDefault();
        updatePost(status);
    }

    return (
        <Group noWrap align='center' spacing={40}>
            <UnstyledButton
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleActionPress(e, 'liked')}
                sx={(theme) => ({ color: liked ? theme.colors.orange[4] : theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })}
            >
                <Group noWrap align='center' spacing={4}>
                    {
                        liked ?
                            <HiHeart size={20} /> :
                            <HiOutlineHeart size={20} />
                    }
                    <Text weight={500}>{postInfo.score}</Text>
                </Group>
            </UnstyledButton>
            <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })}>
                <Group noWrap align='center' spacing={4}>
                    <MdModeComment size={20} />
                    <Text weight={500}>{isStory ? postInfo.replies.length : (postInfo as any).totalComments}</Text>
                </Group>
            </UnstyledButton>
            <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })} onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleActionPress(e, 'favorited')}>
                <MdBookmark size={20} />
            </UnstyledButton>
            <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })} onClick={(e: React.MouseEvent<HTMLButtonElement>) => handleActionPress(e, 'readLater')}>
                <BsClockFill size={20} />
            </UnstyledButton>
        </Group>
    );
}

export default PostControls;