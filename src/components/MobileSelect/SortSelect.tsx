import { Group } from '@mantine/core';
import { useRouter } from 'next/router';
import * as React from 'react';
import { BsTrophy } from 'react-icons/bs';
import { MdWhatshot, MdNewReleases } from 'react-icons/md';
import { useQueryClient } from 'react-query';
import { RedditSortTypeConversion, SortType, TopSorts, TopTimeSort } from 'src/interfaces/sorts';
import { sortTypeMap, topSortTypeMap } from 'src/utils/sortOptionsMap';
import { trpc } from 'src/utils/trpc';
import MobileSelect from '.';

const topSortOptions: { value: string, icon: React.ReactNode }[] = [
    {
        value: 'Today',
        icon: null,
    },
    {
        value: 'This Week',
        icon: null,
    },
    {
        value: 'This Month',
        icon: null,
    },
    {
        value: 'This Year',
        icon: null,
    },
    {
        value: 'All Time',
        icon: null,
    }
];

const sortOptions: { value: string, icon: React.ReactNode }[] = [
    {
        value: 'Popular',
        icon: <MdWhatshot size={20} />,
    },
    {
        value: 'Top',
        icon: <BsTrophy size={20} />,
    },

    {
        value: 'New',
        icon: <MdNewReleases size={20} />,
    }
];


interface SortSelectProps {
    onChange: (newSort: string, newTimeSort?: string) => void
}

const SortSelect = ({ onChange }: SortSelectProps) => {

    const router = useRouter();
    const { sort, time } = router.query;

    const [sortType, setSortType] = React.useState<string>(sort?.toString() ?? 'Popular');
    const [timeSort, setTimeSort] = React.useState<string | undefined>(time?.toString() ?? 'Today');

    const [showTopOptions, setShowTopOptions] = React.useState<boolean | undefined>(time ? undefined : false);
    const [showOptions, setShowOptions] = React.useState<boolean | undefined>(undefined);

    const trpcClient = trpc.useContext();
    const queryClient = useQueryClient();

    const cancelPreviousQuery = async (oldSort: string, oldTime?: string) => {
        console.log("Should cancel query with input: ", sortTypeMap[oldSort as SortType].toString() as RedditSortTypeConversion, topSortTypeMap[oldTime as TopTimeSort].toString() as TopSorts)
        // queryClient.cancelQueries();
        // console.log(queryClient.getQueryData(['post.sort', { sortType: oldSort as RedditSortTypeConversion, timeSort: oldTime as TopSorts }]))
        await trpcClient.cancelQuery(['post.sort', { sortType: sortTypeMap[oldSort as SortType].toString() as RedditSortTypeConversion, timeSort: topSortTypeMap[oldTime as TopTimeSort].toString() as TopSorts }])
    }

    const onSortChange = (newValue: string) => {
        if (newValue === 'Top') {
            setShowOptions(false);
            setShowTopOptions(true);

            router.push(`/?sort=${newValue}&time=${timeSort}`, undefined, { shallow: true })
            onChange(sortTypeMap[newValue as SortType].toString(), topSortTypeMap[timeSort as TopTimeSort].toString())
        } else {
            router.push(`/?sort=${newValue}`, undefined, { shallow: true })
            onChange(sortTypeMap[newValue as SortType].toString())

            setTimeSort('Today')
            setShowOptions(true);
            setShowTopOptions(false);
        }
        setSortType(newValue);
    }

    const onTimeSortChange = (newValue: string) => {
        setTimeSort(newValue);
        router.push(`/?sort=${sortType}&time=${newValue}`, undefined, { shallow: true })
        onChange(sortTypeMap[sortType as SortType].toString(), topSortTypeMap[newValue as TopTimeSort].toString())
    }

    return (
        <>
            <Group noWrap>

                <MobileSelect
                    data={sortOptions.map((val) => val.value)}
                    selectOptions={sortOptions}
                    onChange={onSortChange}
                    onBottomSheetClose={() => { }}
                    bottomSheetOpened={showOptions}
                    defaultActive={sortType}
                    styles={{ justify: 'unset', spacing: 'lg' }}
                />
                {
                    (showTopOptions === undefined || showTopOptions === true) &&
                    <MobileSelect
                        data={topSortOptions.map((val) => val.value)}
                        selectOptions={topSortOptions}
                        onChange={onTimeSortChange}
                        onBottomSheetClose={() => { }}
                        bottomSheetOpened={showTopOptions === true}
                        defaultActive={timeSort}
                        styles={{ justify: 'space-between', spacing: 0 }}
                    />

                }
            </Group>
        </>

    )
}

export default SortSelect;