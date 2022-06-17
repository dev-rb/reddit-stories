import * as React from 'react';
import { Stack, Group, Title, Avatar, TextInput, Box, NativeSelect, ActionIcon, Text, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { BsClockHistory } from 'react-icons/bs';
import { MdSearch, MdArrowDropDown, MdDownload, MdHome, MdBookmarks } from 'react-icons/md';
import './App.css'
import Post from './components/Post';
import { Provider } from 'react-redux';
import { store } from './redux/store';

function App() {
  const largeScreen = useMediaQuery('(min-width: 900px)');

  return (
    <Provider store={store}>
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Stack align='center' sx={{ width: '100%' }}>

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
        </div>
      </MantineProvider>
    </Provider>
  )
}

export default App

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