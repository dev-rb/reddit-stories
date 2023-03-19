import * as React from 'react';
import { useMediaQuery } from '@mantine/hooks';
import MobileSelect from '.';

export type StatusTypeSort = 'All' | 'Prompts' | 'Stories';

const typeOptions: { value: StatusTypeSort; icon: React.ReactNode }[] = [
  { value: 'All', icon: null },
  { value: 'Prompts', icon: null },
  { value: 'Stories', icon: null },
];

interface TypeSelectProps {
  onChange: (newType: StatusTypeSort) => void;
}

const TypeSelect = ({ onChange }: TypeSelectProps) => {
  const largeScreen = useMediaQuery('(min-width: 900px)');

  const [activeSort, setActiveSort] = React.useState<StatusTypeSort>('All');
  const [bottomSheetOpen, setBottomSheetOpen] = React.useState(false);

  const onTypeChange = (newType: string) => {
    setActiveSort(newType as StatusTypeSort);
    onChange(newType as StatusTypeSort);
  };
  const onTypeSelectClick = (e: React.MouseEvent<HTMLSelectElement>) => {
    setBottomSheetOpen(true);
  };
  return (
    <>
      <MobileSelect
        value={activeSort}
        data={typeOptions.map((val) => val.value)}
        selectOptions={typeOptions}
        bottomSheetOpened={bottomSheetOpen && !largeScreen}
        onBottomSheetClose={() => setBottomSheetOpen(false)}
        onChange={onTypeChange}
        onSelectClick={onTypeSelectClick}
        defaultActive={'All'}
        styles={{ justify: 'unset', spacing: 'lg' }}
      />
    </>
  );
};

export default TypeSelect;
