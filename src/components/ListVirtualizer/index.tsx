import * as React from 'react';
import Post from '../Post';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';
import { get } from 'idb-keyval';
import { PromptAndStoriesWithExtendedReplies } from 'src/interfaces/db';

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
    renderItem: (item: VirtualItem<TItemElement>, index: number) => React.ReactNode
}

const ListVirtualizer = <TItem, TItemElement>({ data, renderItem }: ListVirtualizerProps<TItem, TItemElement>) => {
    const rowVirtualizer = useWindowVirtualizer({
        count: data.length,
        getScrollElement: () => window,
        estimateSize: () => 150,
        overscan: 5,
        enableSmoothScroll: true
    });

    React.useEffect(() => {
        rowVirtualizer.measure();
    }, [data])

    // const { scrollToOffset } = rowVirtualizer;
    // React.useEffect(() => {
    //     const resizeHandler = () => (window.document.body.style.height = `${window.innerHeight}px`);
    //     const scrollHandler = () => scrollToOffset(window.scrollY);
    //     window.addEventListener("resize", resizeHandler);
    //     window.addEventListener("scroll", scrollHandler, { passive: true });
    //     window.document.body.style.height = `${window.innerHeight}px`;
    //     scrollToOffset(window.scrollY);
    //     return () => {
    //         window.removeEventListener("resize", resizeHandler);
    //         window.removeEventListener("scroll", scrollHandler);
    //     };
    // }, [scrollToOffset]);



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
                    return (renderItem(virtualItem, index))
                })}
            </div>
        </>
    );
}

export default ListVirtualizer;