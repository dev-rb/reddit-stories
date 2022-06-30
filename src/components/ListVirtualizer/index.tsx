import * as React from 'react';
import Post from '../Post';
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/react-virtual';

interface ListVirtualizerProps {
    data: any[]
}

const ListVirtualizer = ({ data }: ListVirtualizerProps) => {
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
                {rowVirtualizer.getVirtualItems().map((virtualItem: any, index: number) => (
                    <div
                        key={virtualItem.index}
                        ref={virtualItem.measureElement}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            // height: `${virtualItem.size}px`,
                            transform: `translateY(${virtualItem.start}px)`,
                        }}
                    >
                        <Post key={data[virtualItem.index].id} {...data[virtualItem.index]} created={data[virtualItem.index].created} totalStories={0} index={index} />

                    </div>
                ))}
            </div>
        </>
    );
}

export default ListVirtualizer;