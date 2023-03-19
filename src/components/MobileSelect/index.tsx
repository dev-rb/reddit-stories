import * as React from 'react';
import { createStyles, Drawer, Group, MantineNumberSize, NativeSelect, Stack, UnstyledButton } from '@mantine/core';
import { MdArrowDropDown, MdCheck } from 'react-icons/md';

const useStyles = createStyles((theme) => ({
  bottomSheet: {
    width: '100vw',
    zIndex: 9999,
  },
}));

interface SortSelectProps {
  value: string | undefined;
  onChange: (newValue: string) => void;
  selectOptions: { value: string; icon: React.ReactNode }[];
  data: string[];
  defaultActive?: string;
  onBottomSheetClose?: () => void;
  bottomSheetTitle?: string;
  bottomSheetOpened: boolean;
  onSelectClick?: (e: React.MouseEvent<HTMLSelectElement>) => void;
  styles?: {
    spacing?: MantineNumberSize | number;
    justify?: React.CSSProperties['justifyContent'];
  };
}

const MobileSelect = ({
  value,
  onChange,
  onBottomSheetClose,
  data,
  selectOptions,
  bottomSheetTitle = 'Sort Posts By',
  bottomSheetOpened,
  onSelectClick,
  defaultActive,
  styles,
}: SortSelectProps) => {
  const { classes } = useStyles();

  const onSelectChange = (newType: string) => {
    if (newType === value) {
      return;
    }
    onChange(newType);
  };

  return (
    <>
      <NativeSelect
        variant="filled"
        data={data}
        value={value ?? defaultActive}
        rightSection={<MdArrowDropDown />}
        onChange={(e) => {
          onSelectChange(e.target.value);
        }}
        onClick={onSelectClick}
        styles={{ rightSection: { pointerEvents: 'none' } }}
      />

      <Drawer
        className={classes.bottomSheet}
        opened={bottomSheetOpened}
        onClose={() => {
          onBottomSheetClose?.();
        }}
        position="bottom"
        padding={'lg'}
        title={bottomSheetTitle}
        styles={(theme) => ({
          drawer: {
            backgroundColor: theme.colors.dark[6],
            color: theme.colors.dark[2],
          },
        })}
      >
        <Stack spacing={styles?.spacing} justify={styles?.justify} sx={{ height: '80%' }}>
          {selectOptions.map((val) => (
            <SelectOption
              key={val.value}
              {...val}
              updateSortType={onSelectChange}
              active={val.value === (value ?? defaultActive)}
            />
          ))}
        </Stack>
      </Drawer>
    </>
  );
};

export default MobileSelect;

const useSelectOptionStyles = createStyles((theme, { active }: { active: boolean }) => ({
  option: {
    width: '100%',
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    color: active ? 'white' : theme.colors.dark[2],
    fontSize: theme.fontSizes.lg,
    fontWeight: 600,
  },
  activeCheck: {
    color: theme.colors.blue[6],
  },
}));

interface SelectOptionProps {
  value: string;
  icon: React.ReactNode;
  updateSortType: (newType: string) => void;
  active?: boolean;
}

const SelectOption = ({ value, icon, updateSortType, active = false }: SelectOptionProps) => {
  const { classes } = useSelectOptionStyles({ active });

  return (
    <UnstyledButton className={classes.option} onClick={() => updateSortType(value)}>
      <Group noWrap position="apart">
        <Group>
          {icon}
          {value}
        </Group>
        {active && <MdCheck className={classes.activeCheck} size={20} />}
      </Group>
    </UnstyledButton>
  );
};
