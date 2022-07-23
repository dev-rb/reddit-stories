import * as React from 'react';
import { Group, UnstyledButton, Text } from '@mantine/core';
import { BsClockHistory } from 'react-icons/bs';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { MdModeComment, MdBookmark } from 'react-icons/md';
import { Prompt, StoryAndExtendedReplies } from 'src/interfaces/db';
import { trpc } from 'src/utils/trpc';
import { useSession } from 'next-auth/react';

type NeededPromptValues = Pick<Prompt, 'id' | 'liked' | 'score' | 'totalComments'>
type NeededStoryValues = Pick<StoryAndExtendedReplies, 'replies' | 'liked' | 'score' | 'id'>
type PostOrComment = NeededPromptValues | NeededStoryValues

interface PostControlsProps<TData extends PostOrComment> {
    postInfo: TData,
    liked: boolean,
    toggleLiked: () => void
}

const PostControls = <TData extends PostOrComment,>({ postInfo, liked, toggleLiked }: PostControlsProps<TData>) => {

    const session = useSession();

    const { mutate: likePostMutation } = trpc.useMutation('post.like');
    const { mutate: likeStoryMutation } = trpc.useMutation('story.like');

    const likePost = () => {
        if (session.data?.user) {
            toggleLiked();
            if ((postInfo as NeededStoryValues).replies) {
                console.log("Is story")
                likeStoryMutation({ liked: !liked, storyId: postInfo.id, userId: session.data.user.id })
            } else {
                console.log("Is prompt")
                likePostMutation({ liked: !liked, postId: postInfo.id, userId: session.data.user.id })

            }
        } else {
            console.log("Unauthenticated")
        }
    }

    const handleLikePress = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        likePost();
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
            <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })}>
                <MdBookmark size={20} />
            </UnstyledButton>
            <UnstyledButton sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })}>
                <BsClockHistory size={20} />
            </UnstyledButton>
        </Group>
    );
}

export default PostControls;