import * as React from 'react';
import Post from '../Post';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';
import { get } from 'idb-keyval';
import { PromptAndStoriesWithExtendedReplies } from 'src/interfaces/db';
import { Center, Title } from '@mantine/core';

type Key = number | string
interface Item {
    key: Key
    index: number
    start: number
    end: number
    size: number
}

interface VirtualItem<TItemElement> extends Item {
    measureElement: (el: TItemElement | null) => void
}

interface ListVirtualizerProps<TItem, TItemElement> {
    data: TItem[],
    renderItem: (item: VirtualItem<TItemElement>, index: number, remeasure: () => void) => React.ReactNode
}

const ListVirtualizer = <TItem, TItemElement>({ data, renderItem }: ListVirtualizerProps<TItem, TItemElement>) => {
    if (!data) {
        return (
            <Center>
                <Title> No Data </Title>
            </Center>
        )
    }
    const rowVirtualizer = useWindowVirtualizer({
        count: data.length,
        getScrollElement: () => window,
        estimateSize: () => 150,
        overscan: 3,
        enableSmoothScroll: true
    });

    const remeasure = () => {
        rowVirtualizer.measure();
    }

    React.useEffect(() => {
        rowVirtualizer.measure();
    }, [data])

    return (
        <>

            <div
                style={{
                    height: rowVirtualizer.getTotalSize(),
                    width: '100%',
                    position: 'relative',
                }}
            >
                {/* Only the visible items in the virtualizer, manually positioned to be in view */}
                {rowVirtualizer.getVirtualItems().map((virtualItem: VirtualItem<TItemElement>, index: number) => {
                    return (renderItem(virtualItem, index, remeasure))
                })}
            </div>
        </>
    );
}

export default ListVirtualizer;