import { ActionIcon, ColorScheme, ColorSchemeProvider, Group, MantineProvider } from '@mantine/core';
import './App.css'
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { Home } from './pages/Home';
import CommentsContainer from './components/CommentsContainer';
import { useMediaQuery } from '@mantine/hooks';
import { BsClockHistory } from 'react-icons/bs';
import { MdHome, MdBookmarks } from 'react-icons/md';
import { ReactNode, useState } from 'react';
import SavedStories from './pages/SavedStories';
import ReadLaterStories from './pages/ReadLaterStories';

function App() {

  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <Provider store={store}>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          theme={{ colorScheme }}
          withGlobalStyles
          withNormalizeCSS
        >

          <BrowserRouter>
            <BottomNavigationBar />

            <Routes>
              <Route path='/' element={<Home />} />
              <Route path='/posts'>
                <Route path=":postId" element={<CommentsContainer postId='' />} />
              </Route>
              <Route path='/saved' element={<SavedStories />} />
              <Route path='/later' element={<ReadLaterStories />} />
            </Routes>
          </BrowserRouter>
        </MantineProvider>
      </ColorSchemeProvider>
    </Provider>
  )
}

export default App

interface NavLinkProps {
  pathTo: string,
  icon: ReactNode
}

const NavLink = ({ icon, pathTo }: NavLinkProps) => {
  const location = useLocation();

  const isActive = location.pathname === pathTo;

  return (
    <ActionIcon variant='transparent' size='lg' component={Link} to={pathTo} sx={(theme) => ({ color: isActive ? (theme.colorScheme === 'dark' ? theme.black : 'white') : theme.colorScheme === 'dark' ? theme.colors.dark[2] : theme.colors.dark[4] })}>
      {icon}
    </ActionIcon>
  )
}

const navLinks: NavLinkProps[] = [
  {
    pathTo: '/',
    icon: <MdHome size={25} />
  },
  {
    pathTo: '/saved',
    icon: <MdBookmarks size={25} />
  },
  {
    pathTo: '/later',
    icon: <BsClockHistory size={25} />
  }
]

const BottomNavigationBar = () => {
  const largeScreen = useMediaQuery('(min-width: 900px)');

  return (
    <Group noWrap px={40} py='sm' align='center' position='apart' sx={(theme) => ({ background: theme.colorScheme === 'dark' ? 'white' : theme.colors.dark[8], position: 'fixed', bottom: 20, borderRadius: 10, width: largeScreen ? '20vw' : '70vw', left: '50%', transform: 'translateX(-50%)' })}>
      {navLinks.map((navLink) => <NavLink key={navLink.pathTo} {...navLink} />)}
    </Group>
  )
}