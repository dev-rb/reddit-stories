// const newQueryClient = new QueryClient({
//     defaultOptions: {
//         queries: {
//             refetchOnWindowFocus: false,
//             refetchOnReconnect: false,
//             refetchIntervalInBackground: false,
//             cacheTime: Infinity,
//             retryOnMount: false,
//             refetchOnMount: false,
//             retryDelay: Infinity,
//             staleTime: Infinity,
//             refetchInterval: Infinity
//         }
//     }
// })
// function createIDBPersister(idbValidKey: IDBValidKey = "reactQuery") {
//     return {
//         persistClient: async (client: PersistedClient) => {
//             await set(idbValidKey, client);
//         },
//         restoreClient: async () => {
//             return await get<PersistedClient>(idbValidKey);
//         },
//         removeClient: async () => {
//             await del(idbValidKey);
//         },
//     } as Persister;
// }

// function customPersist(
//     props: PersistQueryClientOptions
// ): [() => void, Promise<void>] {

//     let hasUnsubscribed = false
//     let persistQueryClientUnsubscribe: (() => void) | undefined
//     const unsubscribe = () => {
//         hasUnsubscribed = true
//         persistQueryClientUnsubscribe?.()
//     }
//     // props.persister.persistClient({ buster: '', clientState: { mutations: [], queries: [] }, timestamp: 0 });
//     const persistData = () => { console.log("Download called"); persistQueryClientSave(props); }
//     // Attempt restore
//     const restorePromise = persistQueryClientRestore(props)
//     // .then(() => {
//     //     if (!hasUnsubscribed) {
//     //         // Subscribe to changes in the query cache to trigger the save
//     //         persistQueryClientUnsubscribe = persistQueryClientSubscribe(props)
//     //     }
//     // })
//     // .catch((err) => console.log("Inside custom: ", err))

//     return [persistData, restorePromise]
// }

// // const [persistData] = customPersist({
// //     queryClient: newQueryClient,
// //     persister: createIDBPersister(),
// //     maxAge: Infinity
// // })
export { }