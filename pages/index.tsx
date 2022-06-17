import * as React from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Post from '../components/Post';
import { IPost } from '../interfaces/reddit';
import styles from '../styles/Home.module.css';
import { fetchFromUrl } from '../helpers/fetchData';
import { getAllPrompts } from '../helpers/cleanData';
import { MdArrowDropDown, MdBookmarks, MdDownload, MdHistory, MdHome, MdSearch, MdSettings } from 'react-icons/md';
import { useDispatch } from 'react-redux';
import { addPosts } from '../redux/slices';
import { useGetPostsQuery } from '../redux/services';
import { ActionIcon, Avatar, Box, Container, Group, NativeSelect, Stack, Text, TextInput, Title } from '@mantine/core';
import { BsClockHistory } from 'react-icons/bs';
import { useMediaQuery } from '@mantine/hooks';

const count = 100;

const filterMap: { [key: string]: string } = {
  "Popular": "hot",
  "New": "new",
  "Rising": "rising",
};

// TODO: Add scroll restoration when going back from pages
const Home: NextPage = () => {

  const largeScreen = useMediaQuery('(min-width: 900px)');
  // const [selectedFilter, setSelectedFilter] = React.useState("Popular");
  // const { data } = useGetPostsQuery(`${filterMap[selectedFilter]}`)
  // const dispatch = useDispatch();

  // const headerRef = React.useRef<HTMLDivElement>(null);
  // const [postsData, setPostsData] = React.useState<IPost[]>([]);

  // React.useEffect(() => {
  //   if (data) {
  //     setPostsData(data)
  //   }
  // }, [data])

  // // Intersection observer for homeHeader animation
  // React.useEffect(() => {
  //   const observer = new IntersectionObserver(([e]) => {
  //     e.target.toggleAttribute("stuck", e.intersectionRatio < 1);
  //   }, { threshold: [1], rootMargin: '-16px 0px 0px 0px' })
  //   if (headerRef.current) {
  //     observer.observe(headerRef.current);
  //   }

  //   return () => {
  //     if (headerRef.current) {
  //       observer.unobserve(headerRef.current);
  //     }
  //   }
  // }, [])

  return (

    <Stack align='center' sx={{ width: '100%' }}>
      <Head>
        <title>Reddit Stories</title>
        <meta name="description" content="PWA to read r/WritingPrompts Stories" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Stack align='center' spacing={0} sx={{ width: largeScreen ? '40vw' : '100%' }}>
        <Stack p='lg' sx={{ width: '100%' }}>
          <Group noWrap align='start' position='apart' sx={{ width: '100%' }}>
            <Stack spacing={0}>
              <Title sx={{ fontWeight: 200 }}>Explore</Title>
              <Title >Stories</Title>
            </Stack>
            <Avatar radius={'xl'} />
          </Group>

          <TextInput variant='filled' size='lg' mt={40} icon={<MdSearch size={25} />} placeholder='Search Stories' sx={{ width: '100%' }} />
          <Box mt={'lg'} sx={(theme) => ({ width: '100%', minHeight: '10rem', maxHeight: '14rem', backgroundColor: '#3079F8' })}>
            <Text> Test </Text>
          </Box>
        </Stack>
        <Stack spacing={0} sx={{ width: '100%' }}>
          <Group px='lg' pb='lg' pt='sm' align='center' position='apart'>
            <NativeSelect variant='filled' data={['Popular', 'Rising', 'New']} rightSection={<MdArrowDropDown />} />
            <ActionIcon variant='filled'>
              <MdDownload />
            </ActionIcon>
          </Group>
          <Post title={'You are out with a friend when suddenly you blink and everything around you looks ruined and everyone looks like statues. A frail old man looks at you and weeps while he says “After 84 years, I finally was able to wake someone up”'}
            id={''} created={{
              hoursAgo: 0,
              minutesAgo: 0,
              daysAgo: 0
            }} score={1100} author={'username'} permalink={''} stories={[]} />

        </Stack>
      </Stack>
      <BottomNavigationBar />
    </Stack>

  )
}

export default Home

const BottomNavigationBar = () => {
  const largeScreen = useMediaQuery('(min-width: 900px)');

  return (
    <Group noWrap px={40} py='sm' align='center' position='apart' sx={(theme) => ({ background: theme.colors.dark[8], position: 'fixed', bottom: 20, borderRadius: 10, width: largeScreen ? '20vw' : '70vw' })}>
      <ActionIcon size='lg'>
        <MdHome size={25} />
      </ActionIcon>
      <ActionIcon size='lg'>
        <MdBookmarks size={25} />
      </ActionIcon>
      <ActionIcon size='lg'>
        <BsClockHistory size={25} />
      </ActionIcon>
    </Group>
  )
}