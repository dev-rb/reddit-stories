import * as React from 'react';
import { Center, Loader, Text } from '@mantine/core';
import { ListVirtualizerContext } from 'src/utils/contexts/ListVirtualizerContext';
import ListVirtualizer from '../ListVirtualizer';
import { TRPCClientErrorLike } from '@trpc/client';
import { AppRouter } from 'src/server/routers';

interface DataProps<TData extends any[] | []> {
    data?: TData,
    isError: boolean,
    isLoading: boolean,
    isFetching: boolean,
    isRefetching: boolean,
    error: TRPCClientErrorLike<AppRouter> | null
}

interface DataDisplayProps<TData extends any[] | [], TItem> {
    dataInfo: DataProps<TData>,
    renderItem: (currentItem: TItem, index: number) => React.ReactNode
}

const VirtualizedDataDisplay = <TData extends any[] | [], TItem,>({ dataInfo, renderItem }: DataDisplayProps<TData, TItem>) => {

    const { data, isError, error, isFetching, isLoading, isRefetching } = dataInfo;

    if (isLoading || isFetching || isRefetching) {
        return (
            <Center>
                <Loader />
            </Center>
        );
    }

    if (isError) {
        return (
            <Center>
                <Text> {error!.message} </Text>
            </Center>
        )
    }

    return (
        <>
            <ListVirtualizer data={data!} renderItem={(item, index, remeasure) => {
                const currentItem = data![item.index];
                return (
                    <ListVirtualizerContext.Provider key={item.index} value={{ remeasure: remeasure }}>
                        <div

                            ref={item.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                // height: `${item.size}px`,
                                transform: `translateY(${item.start}px)`,
                            }}
                        >
                            {renderItem(currentItem, index)}
                        </div>
                    </ListVirtualizerContext.Provider>
                )
            }}
            />
        </>
    );
}

export default VirtualizedDataDisplay;