import * as React from 'react';
import { Group, UnstyledButton, Text } from '@mantine/core';
import { BsClockFill } from 'react-icons/bs';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { MdModeComment, MdBookmark } from 'react-icons/md';
import { Prompt, StoryAndExtendedReplies } from 'src/interfaces/db';
import { trpc } from 'src/utils/trpc';
import { useSession } from 'next-auth/react';
import { useUser } from 'src/hooks/useUser';

type NeededPromptValues = Pick<Prompt, 'id' | 'liked' | 'score' | 'totalComments'>
type NeededStoryValues = Pick<StoryAndExtendedReplies, 'replies' | 'liked' | 'score' | 'id'>
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

    const { mutate: likePostMutation } = trpc.useMutation('post.like');
    const { mutate: likeStoryMutation } = trpc.useMutation('story.like');

    const { mutate: savePostMutation } = trpc.useMutation('post.favorite');

    const { mutate: readLaterPostMutation } = trpc.useMutation('post.readLater');

    const { userId, isAuthenticated } = useUser();

    const likePost = () => {
        if (isAuthenticated) {
            toggleLiked();
            if ((postInfo as NeededStoryValues).replies) {
                console.log("Is story")
                likeStoryMutation({ liked: !liked, commentId: postInfo.id, userId: userId! })
            } else {
                console.log("Is prompt")
                likePostMutation({ liked: !liked, postId: postInfo.id, userId: userId! })

            }
        } else {
            console.log("Unauthenticated")
        }
    }

    const savePost = () => {
        if (isAuthenticated) {
            toggleSaved();
            if ((postInfo as NeededStoryValues).replies) {
                console.log("Is story")
            } else {
                console.log("Is prompt")
                savePostMutation({ favorited: !favorited, postId: postInfo.id, userId: userId! })

            }
        } else {
            console.log("Unauthenticated")
        }
    }

    const readLaterPost = () => {
        if (isAuthenticated) {
            toggleReadLater();
            if ((postInfo as NeededStoryValues).replies) {
                console.log("Is story")
            } else {
                console.log("Is prompt")
                readLaterPostMutation({ readLater: !readLater, postId: postInfo.id, userId: userId! })

            }
        } else {
            console.log("Unauthenticated")
        }
    }

    const handleSavedPress = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        savePost();
    }

    const handleLikePress = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        likePost();
    }

    const handleReadLaterPress = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        readLaterPost();
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
                    <Text weight={500}>{(postInfo as any).totalComments}</Text>
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