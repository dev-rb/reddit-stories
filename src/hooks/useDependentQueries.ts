import React, { useState } from "react"
import { notifyManager, QueriesObserver, QueriesOptions, QueriesResults, useIsRestoring, useQueryClient } from "react-query"
import { useSyncExternalStore } from "use-sync-external-store/shim"

interface Options<T extends any[]> {
    enabled?: boolean
    queries?: readonly [...QueriesOptions<T>]
}

export const useDependentQueries = <T extends any[]>({ enabled, queries }: Options<T>) => {
    const queryClient = useQueryClient()
    const isRestoring = useIsRestoring()
    console.log(enabled, queries !== undefined)
    const defaultedQueries = React.useMemo(
        () => queries ?
            queries.map((options) => {
                const defaultedOptions = queryClient.defaultQueryOptions(options)

                // Make sure the results are already in fetching state before subscribing or updating options
                defaultedOptions._optimisticResults = isRestoring
                    ? 'isRestoring'
                    : 'optimistic'

                return defaultedOptions
            }) : [],
        [queries, queryClient, isRestoring],
    )

    const [observer] = React.useState(
        () => new QueriesObserver(queryClient),
    )

    const [result, setResult] = useState<QueriesResults<T> | undefined>(enabled === true ? (observer.getOptimisticResult(defaultedQueries) as QueriesResults<T>) : undefined);

    // const result = observer.getOptimisticResult(defaultedQueries)

    useSyncExternalStore(
        React.useCallback(
            (onStoreChange) =>
                isRestoring
                    ? () => undefined
                    : observer.subscribe(notifyManager.batchCalls(onStoreChange)),
            [observer, isRestoring],
        ),
        () => observer.getCurrentResult(),
        () => observer.getCurrentResult(),
    )

    React.useEffect(() => {
        if (enabled === true) {
            setResult(observer.getOptimisticResult(defaultedQueries) as QueriesResults<T>)
        }
    }, [enabled])

    React.useEffect(() => {
        // Do not notify on updates because of changes in the options because
        // these changes should already be reflected in the optimistic result.
        if (enabled === true) {
            observer.setQueries(defaultedQueries, { listeners: false })
        }
    }, [defaultedQueries, observer])

    return result as QueriesResults<T>
}