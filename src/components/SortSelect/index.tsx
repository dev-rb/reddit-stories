import * as React from 'react';
import { createStyles, Drawer, Group, NativeSelect, Stack, UnstyledButton } from '@mantine/core';
import { MdArrowDropDown, MdCheck, MdNewReleases, MdWhatshot } from 'react-icons/md';
import { useMediaQuery } from '@mantine/hooks';
import { BsTrophy } from 'react-icons/bs';
import { useRouter } from 'next/router';

const useStyles = createStyles((theme) => ({
    bottomSheet: {
        width: '100vw',
        zIndex: 9999,
    }
}));

export type TopTimeSort = 'Today' | 'This Week' | 'This Month' | 'This Year' | 'All Time';
export type TopSorts = 'day' | 'week' | 'month' | 'year' | 'all'
export type SortType = 'Popular' | 'Top' | 'New';
export type RedditSortTypeConversion = 'hot' | 'top' | 'new'

export const getSortQuery = (sortType: string, topSort?: string) => {
    if (sortType === 'Top') {
        if (topSort) {
            return `top/?t=${topSortTypeMap[topSort as TopTimeSort].toString()}`
        } else {
            return `top/?t=day`
        }
    }

    return sortTypeMap[sortType as SortType].toString();
}

export const sortTypeMap: { [key in SortType]: RedditSortTypeConversion } = {
    New: 'new',
    Popular: 'hot',
    Top: 'top'
}

export const topSortTypeMap: { [key in TopTimeSort]: TopSorts } = {
    Today: 'day',
    "This Week": 'week',
    "This Month": 'month',
    "This Year": 'year',
    "All Time": 'all',
}

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
    onChange?: (newValue: string, timeSort?: string) => void
}

const SortSelect = ({ onChange }: SortSelectProps) => {

    const [bottomSheetOpen, setBottomSheetOpen] = React.useState(false);

    const router = useRouter();
    const [activeType, setActiveType] = React.useState<string>(router.query.sort?.toString() ?? 'Popular');
    const [activeTopSortType, setActiveTopSortType] = React.useState<string>(router.query.time?.toString() ?? 'Today');
    const [showTopOptions, setShowTopOptions] = React.useState(false);

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const { classes } = useStyles();

    const selectTopTimeSort = (e: React.MouseEvent<HTMLSelectElement>) => {
        if (largeScreen) {
            e.preventDefault();
        } else {
            setBottomSheetOpen(true);
            setShowTopOptions(true);
        }
    }


    const selectSortType = (e: React.MouseEvent<HTMLSelectElement>) => {
        if (largeScreen) {
            e.preventDefault();
        } else {
            setBottomSheetOpen(true);
        }
    }

    const onSortChange = (newType: string) => {
        if (newType === activeType) {
            return;
        }
        if (newType === 'Top') {
            setShowTopOptions(true);
        } else {
            setActiveTopSortType('Today')
        }
        setActiveType(newType);

        if (onChange) {
            if (newType === 'Top') {
                router.push(`/?sort=${newType}&time=${activeTopSortType}`, undefined, { shallow: true })
            } else {
                router.push(`/?sort=${newType}`, undefined, { shallow: true })
            }
            onChange(sortTypeMap[newType as SortType].toString())
        }
    }

    const onTopSortChange = (newType: string) => {
        if (newType === activeTopSortType) {
            return;
        }
        setActiveTopSortType(newType);

        if (onChange) {
            router.push(`/?sort=${activeType}&time=${newType}`, undefined, { shallow: true })
            onChange(sortTypeMap[activeType as SortType].toString(), topSortTypeMap[newType as TopTimeSort].toString())
        }
    }

    React.useEffect(() => {

    }, [activeType, activeTopSortType])

    return (
        <>
            <Group noWrap>
                <NativeSelect variant='filled' data={['Popular', 'Top', 'New']} value={activeType} rightSection={<MdArrowDropDown />} onChange={(e) => { onSortChange(e.target.value) }} onClick={selectSortType} styles={{ rightSection: { pointerEvents: 'none' } }} />
                {activeType === 'Top' &&
                    <NativeSelect variant='filled' data={['Today', 'This Week', 'This Month', 'This Year', 'All Time']} value={activeTopSortType} onChange={(e) => { onTopSortChange(e.target.value) }} onClick={selectTopTimeSort} rightSection={<MdArrowDropDown />} styles={{ rightSection: { pointerEvents: 'none' } }} />
                }
            </Group>
            <Drawer
                className={classes.bottomSheet}
                opened={bottomSheetOpen}
                onClose={() => { setBottomSheetOpen(false); setShowTopOptions(false) }}
                position='bottom'
                padding={'lg'}
                title='Sort Posts By'
                styles={(theme) => ({ 'drawer': { backgroundColor: theme.colors.dark[6], color: theme.colors.dark[2] } })}
            >
                <Stack spacing={showTopOptions ? 0 : 'lg'} justify={showTopOptions ? 'space-between' : 'unset'} sx={{ height: '80%' }}>
                    {
                        showTopOptions ?
                            topSortOptions.map((val) => <SelectOption key={val.value} {...val} updateSortType={onTopSortChange} active={val.value === activeTopSortType} />)
                            :
                            sortOptions.map((val) => <SelectOption key={val.value} {...val} updateSortType={onSortChange} active={val.value === activeType} />)
                    }
                </Stack>
            </Drawer>
        </>
    )
}

export default SortSelect;


const useSelectOptionStyles = createStyles((theme, { active }: { active: boolean }) => ({
    option: {
        width: '100%',
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        color: active ? 'white' : theme.colors.dark[2],
        fontSize: theme.fontSizes.lg,
        fontWeight: 600
    },
    activeCheck: {
        color: theme.colors.blue[6],
    }
}));

interface SelectOptionProps {
    value: string,
    icon: React.ReactNode,
    updateSortType: (newType: string) => void,
    active?: boolean
}

const SelectOption = ({ value, icon, updateSortType, active = false }: SelectOptionProps) => {

    const { classes } = useSelectOptionStyles({ active });

    return (
        <UnstyledButton
            className={classes.option}
            onClick={() => updateSortType(value)}
        >
            <Group noWrap position='apart'>
                <Group>
                    {icon}
                    {value}
                </Group>
                {active && <MdCheck className={classes.activeCheck} size={20} />}
            </Group>

        </UnstyledButton>

    )
}