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

const Post = ({ title, id, score, author, permalink, totalComments, created, index, isDownloaded, liked: postLiked }: Prompt & { index: number, isDownloaded?: boolean }) => {

    const [isRead, setIsRead] = React.useState(false);

    const [downloadedStatus, setDownloadedStatus] = React.useState(false);

    const [liked, setLiked] = React.useState(postLiked ?? false);

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
        (queryClient.getQueryCache().find('post.sort', { exact: false })?.state.data as Prompt[]).forEach((val) => {
            if (val.id === id) {
                val.userRead = true;
            }
        })
    }

    React.useEffect(() => {
        (queryClient.getQueryCache().find('post.sort', { exact: false })?.state.data as Prompt[]).forEach((val) => {
            if (val.id === id) {
                if (val.userRead) {
                    setIsRead(val.userRead);
                }
            }
        })
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
                            <MdFileDownload size={16} color={downloadedStatus ? '#F8A130' : '#313131'} />
                            <BsClockFill size={16} color={'#313131'} />
                            <MdBookmark size={16} color={'#313131'} />
                        </Group>
                    </Group>
                    <Text size='sm' weight={600} color={isRead ? theme.colors.dark[3] : theme.colors.gray[0]}>
                        {title.replace('[WP]', '').trim()}
                    </Text>
                    <PostControls postInfo={{ title, id, score, author, created, totalComments }} liked={liked} toggleLiked={() => setLiked((prev) => !prev)} />
                </Stack>
            </Box>
        </Anchor>
    );
}

export default Post;