import * as React from 'react';
import { Group, UnstyledButton, Text } from '@mantine/core';
import { BsClockFill } from 'react-icons/bs';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { MdModeComment, MdBookmark } from 'react-icons/md';
import { IStory, NormalizedReplies, Prompt, StoryAndExtendedReplies, StoryAndNormalizedReplies } from 'src/interfaces/db';
import { trpc } from 'src/utils/trpc';
import { useSession } from 'next-auth/react';
import { useUser } from 'src/hooks/useUser';
import { useDispatch } from 'react-redux';
import { PostStatus, updatePostStatus, updateReplyStatus, updateStoryStatus } from 'src/redux/slices';
import { useQueryClient } from 'react-query';

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

    const { mutate: likePostMutation } = trpc.useMutation('post.like');
    const { mutate: likeStoryMutation } = trpc.useMutation('story.like');

    const { mutate: savePostMutation } = trpc.useMutation('post.favorite');
    const { mutate: saveStoryMutation } = trpc.useMutation('story.favorite');

    const { mutate: readLaterPostMutation } = trpc.useMutation('post.readLater');
    const { mutate: readLaterStoryMutation } = trpc.useMutation('story.readLater');

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
        if (!isAuthenticated) return;
        switch (status) {
            case 'liked': {
                toggleLiked();
                if (isStory) {
                    console.log("Is story")
                    likeStoryMutation({ liked: !liked, commentId: postInfo.id, userId: userId! })
                } else {
                    console.log("Is prompt")
                    likePostMutation({ liked: !liked, postId: postInfo.id, userId: userId! })
                }
                updateLocalState("liked", !liked);
                break;
            }
            case 'readLater': {
                toggleReadLater();
                if (isStory) {
                    console.log("Is story")
                    readLaterStoryMutation({ readLater: !readLater, commentId: postInfo.id, userId: userId! })
                } else {
                    console.log("Is prompt")
                    readLaterPostMutation({ readLater: !readLater, postId: postInfo.id, userId: userId! })

                }
                updateLocalState("readLater", !readLater);
                break;
            }
            case 'saved': {
                toggleSaved();
                if (isStory) {
                    console.log("Is story")
                    saveStoryMutation({ favorited: !favorited, commentId: postInfo.id, userId: userId! })
                } else {
                    console.log("Is prompt")
                    savePostMutation({ favorited: !favorited, postId: postInfo.id, userId: userId! })

                }
                updateLocalState("saved", !favorited);
                break;
            }
        }
    }

    const handleSavedPress = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        updatePost('saved');
    }

    const handleLikePress = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        updatePost('liked');
    }

    const handleReadLaterPress = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        updatePost('readLater');
    }

    return (
        <Group noWrap align='center' spacing={40}>
            <UnstyledButton
                onClick={handleLikePress}
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
            <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })} onClick={handleSavedPress}>
                <MdBookmark size={20} />
            </UnstyledButton>
            <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })} onClick={handleReadLaterPress}>
                <BsClockFill size={20} />
            </UnstyledButton>
        </Group>
    );
}

export default PostControls;