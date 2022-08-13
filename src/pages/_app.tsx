import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head';
import { Provider } from 'react-redux';
import { setCookies } from 'cookies-next';
import { persistor, store } from '../redux/store';
import { ColorScheme, ColorSchemeProvider, Global, MantineProvider } from '@mantine/core';
import AppLayout from '../components/AppLayout';
import { useLocalStorage } from '@mantine/hooks';
import { createContext, useState } from 'react';
import { trpc } from 'src/utils/trpc';
import { QueryClient, QueryClientProvider } from 'react-query';
import { get, set, del } from "idb-keyval";
import { PersistGate } from 'redux-persist/integration/react';
import { ModalsProvider } from '@mantine/modals';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { httpLink } from '@trpc/client/links/httpLink';
import { splitLink } from '@trpc/client/links/splitLink';
import { SessionProvider } from 'next-auth/react';
import { NotificationsProvider } from '@mantine/notifications';

const url = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}/api/trpc`
    : 'http://localhost:3000/api/trpc';

function MyApp({ Component, pageProps, colorScheme }: AppProps & { colorScheme: ColorScheme }) {

    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchIntervalInBackground: false,
                cacheTime: Infinity,
                retryOnMount: false,
                refetchOnMount: false,
                retryDelay: Infinity,
                staleTime: Infinity,
                refetchInterval: Infinity
            }
        }
    }));
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                splitLink({
                    condition(op) {
                        // check for context property `skipBatch`
                        return op.context.skipBatch === true;
                    },
                    // when condition is true, use normal request
                    true: httpLink({
                        url,
                    }),
                    // when condition is false, use batching
                    false: httpBatchLink({
                        url,
                    }),
                }),
            ],
            // url: url,
        }

        ))

    const [theme, setColorTheme] = useLocalStorage<ColorScheme>({
        key: 'mantine-color-scheme',
        defaultValue: 'light',
        getInitialValueInEffect: true,
    });

    const toggleColorScheme = (value?: ColorScheme) => {
        const nextColorScheme = value || (theme === 'dark' ? 'light' : 'dark');
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
                <meta name="description" content="Site and PWA for r/writingprompts" />
                <meta name="keywords" content="Reddit WritingPrompts Tavern Tales Stories Short" />
                <title>Tavern Tales</title>

                {/* <link rel="manifest" href="/manifest.json" /> */}
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
            <SessionProvider>
                <trpc.Provider client={trpcClient} queryClient={queryClient}>
                    <QueryClientProvider client={queryClient}>
                        <Provider store={store}>
                            <PersistGate loading={null} persistor={persistor}>
                                <ColorSchemeProvider colorScheme={theme} toggleColorScheme={toggleColorScheme}>
                                    <MantineProvider
                                        theme={{ colorScheme: theme, fontFamily: 'Roboto, sans-serif' }}
                                        withGlobalStyles
                                        withNormalizeCSS
                                    >
                                        <Global
                                            styles={(theme) => ({
                                                '*, *::before, *::after': {
                                                    boxSizing: 'border-box',
                                                },

                                                body: {
                                                    overflowX: 'hidden'
                                                },
                                            })}
                                        />
                                        <NotificationsProvider position='bottom-center' limit={3}>
                                            <ModalsProvider>
                                                <AppLayout>
                                                    <Component {...pageProps} />

                                                </AppLayout>
                                            </ModalsProvider>
                                        </NotificationsProvider>
                                    </MantineProvider>
                                </ColorSchemeProvider>
                            </PersistGate>
                        </Provider>
                    </QueryClientProvider>
                </trpc.Provider>
            </SessionProvider>

        </>
    );
}

export default MyApp;
