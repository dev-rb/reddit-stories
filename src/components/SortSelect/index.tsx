import * as React from 'react';
import { Box, createStyles, Drawer, Group, keyframes, NativeSelect, Stack, UnstyledButton } from '@mantine/core';
import { MdArrowDropDown, MdCheck, MdNewReleases, MdTrendingFlat, MdTrendingUp, MdWhatshot } from 'react-icons/md';
import { useMediaQuery } from '@mantine/hooks';
import { BsTrophy } from 'react-icons/bs';

const useStyles = createStyles((theme) => ({
    bottomSheet: {
        width: '100vw',
    }
}));

export type SortType = 'Popular' | 'Top' | 'New';
type RedditSortTypeConversion = 'hot' | 'top' | 'new'

export const sortTypeMap: { [key in SortType]: RedditSortTypeConversion } = {
    New: 'new',
    Popular: 'hot',
    Top: 'top'
}

const sortOptions: { type: SortType, icon: React.ReactNode }[] = [
    {
        type: 'Popular',
        icon: <MdWhatshot size={20} />,
    },
    {
        type: 'Top',
        icon: <BsTrophy size={20} />,
    },

    {
        type: 'New',
        icon: <MdNewReleases size={20} />,
    }
];

interface SortSelectProps {
    onChange?: (newValue: SortType) => void
}

const SortSelect = ({ onChange }: SortSelectProps) => {

    const [bottomSheetOpen, setBottomSheetOpen] = React.useState(false);

    const [activeType, setActiveType] = React.useState<SortType>('Popular');

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const { classes } = useStyles();

    const selectSortType = (e: React.MouseEvent<HTMLSelectElement>) => {
        if (largeScreen) {
            e.preventDefault();
        } else {
            setBottomSheetOpen(true);
        }
    }

    const updateSortType = (newType: SortType) => {
        if (newType === activeType) {
            return;
        }

        setActiveType(newType);
        if (onChange) {
            onChange(newType);
        }
    }

    const selectOnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (onChange) {
            onChange(e.target.value as SortType);
            updateSortType(e.target.value as SortType);
        }
    }

    return (
        <>
            <NativeSelect variant='filled' data={['Popular', 'Top', 'New']} value={activeType.toString()} rightSection={<MdArrowDropDown />} onChange={selectOnChange} onClick={selectSortType} styles={{ rightSection: { pointerEvents: 'none' } }} />
            <Drawer
                className={classes.bottomSheet}
                opened={bottomSheetOpen}
                onClose={() => setBottomSheetOpen(false)}
                position='bottom'
                padding={'lg'}
                title='Sort Posts By'
                styles={(theme) => ({ 'drawer': { backgroundColor: theme.colors.dark[6], color: theme.colors.dark[2] } })}
            >
                <Stack>
                    {sortOptions.map((val) => <SelectOption key={val.type.toString()} {...val} updateSortType={updateSortType} active={val.type === activeType} />)}
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
    type: SortType,
    icon: React.ReactNode,
    updateSortType: (newType: SortType) => void,
    active?: boolean
}

const SelectOption = ({ type, icon, updateSortType, active = false }: SelectOptionProps) => {

    const { classes } = useSelectOptionStyles({ active });

    return (
        <UnstyledButton
            className={classes.option}
            onClick={() => updateSortType(type)}
        >
            <Group noWrap position='apart'>
                <Group>
                    {icon}
                    {type.toString()}
                </Group>
                {active && <MdCheck className={classes.activeCheck} size={20} />}
            </Group>

        </UnstyledButton>

    )
}