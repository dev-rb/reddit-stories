import '../src/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head';
import { Provider } from 'react-redux';
import { getCookie, setCookies } from 'cookies-next';
import { store } from '../src/redux/store';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { useState } from 'react';
import { GetServerSidePropsContext } from 'next';
import BottomNavigationBar from '../src/components/BottomNavigationBar';
import AppLayout from '../src/components/AppLayout';


function MyApp({ Component, pageProps, colorScheme }: AppProps & { colorScheme: ColorScheme }) {

    const [theme, setColorTheme] = useState<ColorScheme>(colorScheme);

    const toggleColorScheme = (value?: ColorScheme) => {
        const nextColorScheme = value || (colorScheme === 'dark' ? 'light' : 'dark');
        setColorTheme(nextColorScheme);
        setCookies('mantine-color-scheme', nextColorScheme, { maxAge: 60 * 60 * 24 * 30 });
    };

    return (
        <>
            <Head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta
                    name="viewport"
                    content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no"
                />
                <meta name="description" content="Description" />
                <meta name="keywords" content="Keywords" />
                <title>Reddit Stories</title>

                <link rel="manifest" href="/manifest.json" />
                <link
                    href="/icons/favicon-16x16.png"
                    rel="icon"
                    type="image/png"
                    sizes="16x16"
                />
                <link
                    href="/icons/favicon-32x32.png"
                    rel="icon"
                    type="image/png"
                    sizes="32x32"
                />
                <link rel="apple-touch-icon" href="/logo.png"></link>
                <meta name="theme-color" content="#317EFB" />
            </Head>
            <Provider store={store}>
                <ColorSchemeProvider colorScheme={theme} toggleColorScheme={toggleColorScheme}>
                    <MantineProvider
                        theme={{ colorScheme: theme }}
                        withGlobalStyles
                        withNormalizeCSS
                    >
                        <AppLayout>
                            <Component {...pageProps} />

                        </AppLayout>

                    </MantineProvider>
                </ColorSchemeProvider>
            </Provider>

        </>
    );
}

MyApp.getInitialProps = ({ ctx }: { ctx: GetServerSidePropsContext }) => ({
    colorScheme: getCookie('mantine-color-scheme', ctx) || 'light',
});
export default MyApp