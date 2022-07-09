import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head';
import { Provider } from 'react-redux';
import { setCookies } from 'cookies-next';
import { persistor, store } from '../redux/store';
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import AppLayout from '../components/AppLayout';
import { useLocalStorage } from '@mantine/hooks';
import { createContext, useState } from 'react';
import { trpc } from 'src/utils/trpc';
import { QueryClient, QueryClientProvider } from 'react-query';
import { PersistedClient, Persister, PersistQueryClientOptions, persistQueryClientRestore, persistQueryClientSave } from 'react-query/persistQueryClient'
import { get, set, del } from "idb-keyval";
import { PersistGate } from 'redux-persist/integration/react';

const newQueryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchIntervalInBackground: false,
            // cacheTime: Infinity,
            staleTime: Infinity,
            refetchInterval: Infinity
        }
    }
})
function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
    return {
        persistClient: async (client: PersistedClient) => {
            await set(idbValidKey, client);
        },
        restoreClient: async () => {
            return await get<PersistedClient>(idbValidKey);
        },
        removeClient: async () => {
            await del(idbValidKey);
        },
    } as Persister;
}

function customPersist(
    props: PersistQueryClientOptions
): [() => void, Promise<void>] {

    let hasUnsubscribed = false
    let persistQueryClientUnsubscribe: (() => void) | undefined
    const unsubscribe = () => {
        hasUnsubscribed = true
        persistQueryClientUnsubscribe?.()
    }
    // props.persister.persistClient({ buster: '', clientState: { mutations: [], queries: [] }, timestamp: 0 });
    const persistData = () => { console.log("Download called"); persistQueryClientSave(props); }
    // Attempt restore
    const restorePromise = persistQueryClientRestore(props)
    // .then(() => {
    //     if (!hasUnsubscribed) {
    //         // Subscribe to changes in the query cache to trigger the save
    //         persistQueryClientUnsubscribe = persistQueryClientSubscribe(props)
    //     }
    // })
    // .catch((err) => console.log("Inside custom: ", err))

    return [persistData, restorePromise]
}

// const [persistData] = customPersist({
//     queryClient: newQueryClient,
//     persister: createIDBPersister(),
//     maxAge: Infinity
// })

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
                        <PersistGate loading={null} persistor={persistor}>
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
                        </PersistGate>
                    </Provider>
                </QueryClientProvider>
            </trpc.Provider>

        </>
    );
}

export default MyApp;