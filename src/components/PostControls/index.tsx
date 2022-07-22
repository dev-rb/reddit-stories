import * as React from 'react';
import { Group, UnstyledButton, Text } from '@mantine/core';
import { BsClockHistory } from 'react-icons/bs';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { MdModeComment, MdBookmark } from 'react-icons/md';
import { Prompt, StoryAndExtendedReplies } from 'src/interfaces/db';
import { trpc } from 'src/utils/trpc';
import { useSession } from 'next-auth/react';

type PostOrComment = Omit<Prompt, 'updatedAt' | 'permalink' | 'totalComments'> | StoryAndExtendedReplies

interface PostControlsProps<TData extends PostOrComment> {
    postInfo: TData,
    liked: boolean,
    score: number,
    totalStories: number,
    toggleLiked: () => void
}

const PostControls = <TData extends PostOrComment,>({ postInfo, liked, score, totalStories, toggleLiked }: PostControlsProps<TData>) => {

    const session = useSession();

    const { mutate: likePostMutation } = trpc.useMutation('post.like');

    const likePost = () => {
        if (session.data?.user) {
            likePostMutation({ liked: true, postId: postInfo.id, userId: session.data.user.id })
        } else {
            console.log("Unauthenticated")
        }
    }

    return (
        <Group noWrap align='center' spacing={40}>
            <UnstyledButton
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); e.preventDefault(); toggleLiked(); }}
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
                    <Text weight={500}>{totalStories}</Text>
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