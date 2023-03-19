import * as React from 'react';
import { Center, Loader, Text, Title } from '@mantine/core';
import { TRPCClientErrorLike } from '@trpc/client';
import { AppRouter } from 'src/server/routers';
import { useWindowVirtualizer, VirtualItem } from '@tanstack/react-virtual';

interface DataProps<TData extends any[]> {
  data?: TData;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isRefetching: boolean;
  error: TRPCClientErrorLike<AppRouter> | null;
}

interface DataDisplayProps<TData extends any[], TItem> {
  dataInfo: DataProps<TData>;
  renderItem: (currentItem: TItem, index: number) => React.ReactNode;
}

const VirtualizedDataDisplay = <TData extends any[], TItem>({
  dataInfo,
  renderItem,
}: DataDisplayProps<TData, TItem>) => {
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
      <Center
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translateX(-50%)',
          flexDirection: 'column',
        }}
      >
        <Text size="xl"> Something went wrong </Text>
        <Text size="xl"> .·´¯`(&gt;▂&lt;)´¯`·. </Text>
      </Center>
    );
  }

  if (!data) {
    return (
      <Center>
        <Title> No Data </Title>
      </Center>
    );
  }

  const virtualizer = useWindowVirtualizer({
    count: data.length,
    estimateSize: () => 150,
    overscan: 4,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <>
      <div
        style={{
          height: virtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${items[0].start - virtualizer.options.scrollMargin}px)`,
          }}
        >
          {items.map((item: VirtualItem, index: number) => {
            const currentItem = data![item.index];
            return (
              <div key={item.key} ref={virtualizer.measureElement} data-index={item.index}>
                {renderItem(currentItem, index)}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default VirtualizedDataDisplay;
