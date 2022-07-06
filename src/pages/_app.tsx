import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head';
import { Provider } from 'react-redux';
import { setCookies } from 'cookies-next';
import { store } from '../redux/store';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import AppLayout from '../components/AppLayout';
import { useLocalStorage } from '@mantine/hooks';
import { withTRPC } from '@trpc/next';
import { useState } from 'react';
import { AppRouter } from '../server/routers';
import { trpc } from 'src/utils/trpc';
import { QueryClient, QueryClientProvider } from 'react-query';
import { persistQueryClient, PersistedClient, Persister } from 'react-query/persistQueryClient'
import { get, set, del } from "idb-keyval";

const newQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchIntervalInBackground: false,
            cacheTime: Infinity,
            staleTime: Infinity,
            refetchInterval: Infinity
        }
    }
})
function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
    return {
        persistClient: async (client: PersistedClient) => {
            set(idbValidKey, client);
        },
        restoreClient: async () => {
            return await get<PersistedClient>(idbValidKey);
        },
        removeClient: async () => {
            await del(idbValidKey);
        },
    } as Persister;
}
const [unsubscribe, restorePromise] = persistQueryClient({
    queryClient: newQueryClient,
    persister: createIDBPersister(),
})

function MyApp({ Component, pageProps, colorScheme }: AppProps & { colorScheme: ColorScheme }) {

    const [queryClient] = useState(newQueryClient);
    const [trpcClient] = useState(() =>
        trpc.createClient({
            url: process.env.VERCEL_URL
                ? `https://${process.env.VERCEL_URL}/api/trpc`
                : 'http://localhost:3000/api/trpc',
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
                <meta name="description" content="Description" />
                <meta name="keywords" content="Keywords" />
                <title>Reddit Stories</title>

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
            <trpc.Provider client={trpcClient} queryClient={queryClient}>
                <QueryClientProvider client={queryClient}>
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
                </QueryClientProvider>
            </trpc.Provider>

        </>
    );
}

export default MyApp;