import * as React from 'react';
import { IPost } from '../../interfaces/reddit';
import { MdBookmark, MdFileDownload, MdModeComment } from 'react-icons/md';
import { BsClockHistory } from 'react-icons/bs';
import { HiOutlineHeart } from 'react-icons/hi';
import { useSwipeControls } from '../../hooks/useSwipeControls';
import { Anchor, Box, Group, Stack, Text, Title, UnstyledButton } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';

const Post = ({ title, id, score, author, permalink, stories, created }: IPost) => {
    // href={`https://www.reddit.com${permalink}`}

    const postRef = React.useRef<HTMLDivElement>(null);

    const [requests, setRequests] = React.useState({ download: false, readLater: false, pending: false });

    const updateForRequest = (typeOfRequest: string, setTo: boolean = false) => {
        if (typeOfRequest === 'download') {
            setRequests((prev) => ({ ...prev, download: true, pending: false }));
        } else if (typeOfRequest === 'readLater') {
            setRequests((prev) => ({ ...prev, readLater: true, pending: false }));
        } else if (typeOfRequest === 'pending') {
            setRequests((prev) => ({ ...prev, pending: true }));
        }
    }

    const { onDragPost, onDragging, onDragStop, downloadRequest, readLaterRequest } = useSwipeControls(postRef, updateForRequest);

    const largeScreen = useMediaQuery('(min-width: 900px)');


    return (
        // <Anchor component={Link} href={`/posts/${id}`}>
        <Box px='lg' py='sm' mt={-2} sx={(theme) => ({ borderTop: '2px solid', borderBottom: '2px solid', borderColor: theme.colors.gray[2], width: largeScreen ? '100%' : '100vw', maxHeight: '12rem' })}>
            <Stack sx={{ width: '100%' }} spacing={'md'}>

                <Group align='center' position='apart'>
                    <Group noWrap spacing={4} align='center' sx={(theme) => ({ color: theme.colors.gray[5] })}>
                        <Title order={6} sx={(theme) => ({ fontSize: theme.fontSizes.xs })}>u/{author}</Title>
                        <Text size='lg'>·</Text>
                        <Text size='xs'>{created.daysAgo == 0 ? created.hoursAgo == 0 ? `${created.minutesAgo} minutes ago` : `${created.hoursAgo} hours ago` : `${created.daysAgo} days ago`}</Text>
                    </Group>
                    <Group noWrap spacing={10}>
                        <MdFileDownload onClick={(e) => { e.stopPropagation(); updateForRequest('download') }} size={16} color={requests.download ? '#F8A130' : '#313131'} />
                        <BsClockHistory onClick={(e) => { e.stopPropagation(); updateForRequest('readLater') }} size={16} color={requests.readLater ? '#3079F8' : '#313131'} />
                    </Group>
                </Group>
                <Text size='sm' lineClamp={3}>
                    {title.replace('[WP]', '').trim()}
                </Text>
                <Group noWrap align='center' spacing={40}>
                    <UnstyledButton sx={(theme) => ({ color: theme.colors.gray[4] })}>
                        <Group noWrap align='center' spacing={4}>
                            <HiOutlineHeart size={20} />
                            <Text weight={500}>{score}</Text>
                        </Group>
                    </UnstyledButton>
                    <UnstyledButton sx={(theme) => ({ color: theme.colors.gray[4] })}>
                        <Group noWrap align='center' spacing={4}>
                            <MdModeComment size={20} />
                            <Text weight={500}>{stories.length}</Text>
                        </Group>
                    </UnstyledButton>
                    <UnstyledButton sx={(theme) => ({ color: theme.colors.gray[4] })}>
                        <MdBookmark size={20} />
                    </UnstyledButton>
                    <UnstyledButton sx={(theme) => ({ color: theme.colors.gray[4] })}>
                        <BsClockHistory size={20} />
                    </UnstyledButton>
                </Group>
            </Stack>
        </Box>
        // </Anchor>
    );
}

export default Post;