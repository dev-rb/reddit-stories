import { get, set } from 'idb-keyval';
import * as React from 'react';
import { DehydratedState, hydrate, QueryClient, useQueryClient } from "react-query"

interface Options {
    queryClient: QueryClient
}

export const useDownload = ({ queryClient }: Options) => {

// Test
    function download() {
        const cacheData = queryClient.getQueryCache().getAll();

        const dataLength = cacheData.length;

        let dehydratedState: DehydratedState = { mutations: [], queries: [] }

        for (let i = 0; i < dataLength; i++) {
            const val = cacheData[i];
            dehydratedState.queries.push({ queryHash: val.queryHash, queryKey: val.queryKey, state: val.state })
        }

        addDataToIndexedDB(dehydratedState);
    }

    async function addDataToIndexedDB(dehydratedState: DehydratedState) {
        await set('prompts-stories', dehydratedState);
    }

    async function getDataFromIndexedDB() {
        return await get('prompts-stories');
    }

    async function updateCache() {
        const dbData: DehydratedState | undefined = await getDataFromIndexedDB();

        if (dbData) {
            hydrate(queryClient, dbData)
        }
    }

    React.useEffect(() => {
        updateCache();
    }, [])

    return { download }
}
