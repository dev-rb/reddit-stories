import * as React from 'react';
import { MdBookmark, MdFileDownload, MdModeComment } from 'react-icons/md';
import { BsCheck, BsClock, BsClockFill, BsClockHistory } from 'react-icons/bs';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import { Anchor, Box, Group, Stack, Text, Title, UnstyledButton, useMantineTheme } from '@mantine/core';
import { useDidUpdate, useMediaQuery } from '@mantine/hooks';
import Link from 'next/link';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import PostControls from '../PostControls';
import { Prompt } from 'src/interfaces/db';
import { useQueryClient } from 'react-query';

dayjs.extend(relativeTime)

const Post = ({ title, id, score, author, permalink, totalComments, created, index, isDownloaded, liked: postLiked, saved: postSaved, readLater: postReadLater }: Prompt & { index: number, isDownloaded?: boolean }) => {

    const [isRead, setIsRead] = React.useState(false);

    const [downloadedStatus, setDownloadedStatus] = React.useState(false);

    const [liked, setLiked] = React.useState(postLiked ?? false);
    const [saved, setSaved] = React.useState(postSaved ?? false);
    const [later, setLater] = React.useState(postReadLater ?? false);

    const postRef = React.useRef<HTMLDivElement>(null);

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const theme = useMantineTheme();

    const queryClient = useQueryClient();

    React.useEffect(() => {
        if (isDownloaded !== undefined) {
            setDownloadedStatus(isDownloaded)
        }
    }, [isDownloaded])

    const markAsRead = () => {
        const queryCache = (queryClient.getQueryCache().find('post.sort', { exact: false })?.state.data as Prompt[]);
        if (queryCache) {
            queryCache.forEach((val) => {
                if (val.id === id) {
                    val.userRead = true;
                }
            })
        }
    }

    React.useEffect(() => {
        const queryCache = (queryClient.getQueryCache().find('post.sort', { exact: false })?.state.data as Prompt[]);
        if (queryCache) {
            queryCache.forEach((val) => {
                if (val.id === id) {
                    if (val.userRead) {
                        setIsRead(val.userRead);
                    }
                }
            })
        }
    }, [queryClient, id])

    return (
        <Anchor variant='text' component={Link} href={`/posts/${id}`} >
            <Box ref={postRef} px='lg' py='sm' onClick={markAsRead} mt={-1} sx={(theme) => ({ borderTop: '1px solid', borderBottom: '1px solid', borderColor: theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2], width: largeScreen ? '100%' : '100vw' })}>
                <Stack sx={{ width: '100%' }} spacing={'md'}>

                    <Group align='center' position='apart'>
                        <Group noWrap spacing={4} align='center' sx={(theme) => ({ color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[5] })}>
                            <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>u/{author}</Title>
                            <Text size='lg'>·</Text>
                            <Text size='xs'>{dayjs(created).fromNow()}</Text>
                        </Group>
                        <Group noWrap spacing={10}>
                            <MdFileDownload size={16} color={downloadedStatus ? '#F84B30' : theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]} />
                            <BsClockFill size={16} color={later ? '#F8A130' : theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]} />
                            <MdBookmark size={16} color={saved ? '#30CFF8' : theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]} />
                        </Group>
                    </Group>
                    <Text size='sm' weight={600} color={isRead ? (theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[6]) : (theme.colorScheme === 'dark' ? theme.colors.gray[0] : theme.black)}>
                        {title.replace('[WP]', '').trim()}
                    </Text>
                    <PostControls
                        postInfo={{ title, id, score, author, created, totalComments }}
                        liked={liked}
                        toggleLiked={() => setLiked((prev) => !prev)}
                        favorited={saved}
                        toggleSaved={() => setSaved((prev) => !prev)}
                        readLater={later}
                        toggleReadLater={() => setLater((prev) => !prev)}
                    />
                </Stack>
            </Box>
        </Anchor>
    );
}

export default Post;