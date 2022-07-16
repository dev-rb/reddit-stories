import * as React from 'react';
import { MdBookmark, MdFileDownload, MdModeComment } from 'react-icons/md';
import { BsClockHistory } from 'react-icons/bs';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { Anchor, Box, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Post } from '@prisma/client';

dayjs.extend(relativeTime)

const Post = ({ title, id, score, author, permalink, totalStories, created, index, isDownloaded }: Post & { totalStories: number, index: number, isDownloaded?: boolean }) => {

    const [downloadedStatus, setDownloadedStatus] = React.useState(false);

    const [liked, setLiked] = React.useState(false);

    const postRef = React.useRef<HTMLDivElement>(null);

    const largeScreen = useMediaQuery('(min-width: 900px)');

    React.useEffect(() => {
        if (isDownloaded) {
            setDownloadedStatus(isDownloaded)
            //     setTimeout(() => {
            //     console.log("Update downloaded Status in post")
            //     setDownloadedStatus(isDownloaded)
            // }, 120 * index)
        }
    }, [isDownloaded])

    return (
        <Anchor variant='text' component={Link} href={`/posts/${id}`}>
            <Box ref={postRef} px='lg' py='sm' mt={-1} sx={(theme) => ({ borderTop: '1px solid', borderBottom: '1px solid', borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2], width: largeScreen ? '100%' : '100vw' })}>
                <Stack sx={{ width: '100%' }} spacing={'md'}>

                    <Group align='center' position='apart'>
                        <Group noWrap spacing={4} align='center' sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5] })}>
                            <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>u/{author}</Title>
                            <Text size='lg'>·</Text>
                            <Text size='xs'>{dayjs(created).fromNow()}</Text>
                        </Group>
                        <Group noWrap spacing={10}>
                            <MdFileDownload size={16} color={downloadedStatus ? '#F8A130' : '#313131'} />
                            <BsClockHistory size={16} color={'#313131'} />
                        </Group>
                    </Group>
                    <Text size='sm' weight={600}>
                        {title.replace('[WP]', '').trim()}
                    </Text>
                    <Group noWrap align='center' spacing={40}>
                        <UnstyledButton
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); e.preventDefault(); setLiked((prev) => !prev); }}
                            sx={(theme) => ({ color: liked ? theme.colors.orange[4] : theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4] })}
                        >
                            <Group noWrap align='center' spacing={4}>
                                {
                                    liked ?
                                        <HiHeart size={20} /> :
                                        <HiOutlineHeart size={20} />
                                }
                                <Text weight={500}>{score}</Text>
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
                </Stack>
            </Box>
        </Anchor>
    );
}

export default Post;