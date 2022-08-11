import * as React from 'react';
import { createStyles, Drawer, Group, MantineNumberSize, NativeSelect, Stack, StackProps, UnstyledButton } from '@mantine/core';
import { MdArrowDropDown, MdCheck } from 'react-icons/md';
import { useDidUpdate, useMediaQuery } from '@mantine/hooks';
import { useRouter } from 'next/router';

const useStyles = createStyles((theme) => ({
    bottomSheet: {
        width: '100vw',
        zIndex: 9999,
    }
}));


interface SortSelectProps {
    onChange: (newValue: string) => void,
    selectOptions: { value: string, icon: React.ReactNode }[],
    data: string[],
    defaultActive?: string,
    onBottomSheetClose: () => void,
    bottomSheetTitle?: string,
    bottomSheetOpened?: boolean,
    styles?: {
        spacing?: MantineNumberSize | number,
        justify?: React.CSSProperties['justifyContent']
    }

}

const MobileSelect = ({ onChange, onBottomSheetClose, data, selectOptions, bottomSheetTitle = 'Sort Posts By', bottomSheetOpened, defaultActive, styles }: SortSelectProps) => {

    const [bottomSheetOpen, setBottomSheetOpen] = React.useState(bottomSheetOpened ?? false);

    const router = useRouter();
    const [activeValue, setActiveValue] = React.useState<string>(defaultActive ?? '');

    const largeScreen = useMediaQuery('(min-width: 900px)');

    const { classes } = useStyles();

    const selectSortType = (e: React.MouseEvent<HTMLSelectElement>) => {
        if (largeScreen) {
            e.preventDefault();
        } else {
            setBottomSheetOpen(true);
        }
    }

    const onSelectChange = (newType: string) => {
        if (newType === activeValue) {
            return;
        }
        setActiveValue(newType);
        onChange(newType);
    }

    useDidUpdate(() => {
        setBottomSheetOpen(bottomSheetOpened ?? false);
        console.log(`${data[0]} is open?: `, bottomSheetOpened)
    }, [bottomSheetOpened])

    return (
        <>
            <NativeSelect variant='filled' data={data} value={activeValue} rightSection={<MdArrowDropDown />} onChange={(e) => { onSelectChange(e.target.value) }} onClick={selectSortType} styles={{ rightSection: { pointerEvents: 'none' } }} />

            <Drawer
                className={classes.bottomSheet}
                opened={bottomSheetOpen && !largeScreen}
                onClose={() => { setBottomSheetOpen(false); onBottomSheetClose(); }}
                position='bottom'
                padding={'lg'}
                title={bottomSheetTitle}
                styles={(theme) => ({ 'drawer': { backgroundColor: theme.colors.dark[6], color: theme.colors.dark[2] } })}
            >
                <Stack spacing={styles?.spacing} justify={styles?.justify} sx={{ height: '80%' }}>
                    {
                        selectOptions.map((val) => <SelectOption key={val.value} {...val} updateSortType={onSelectChange} active={val.value === activeValue} />)

                    }
                </Stack>

            </Drawer>
        </>
    )
}

export default MobileSelect;


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