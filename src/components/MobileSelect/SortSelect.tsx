import { Group } from '@mantine/core';
import { useRouter } from 'next/router';
import * as React from 'react';
import { BsTrophy } from 'react-icons/bs';
import { MdWhatshot, MdNewReleases } from 'react-icons/md';
import { SortType, TopTimeSort } from 'src/types/sorts';
import { sortTypeMap, topSortTypeMap } from 'src/utils/sortOptionsMap';
import MobileSelect from '.';

const topSortOptions: { value: string; icon: React.ReactNode }[] = [
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
  },
];

const sortOptions: { value: string; icon: React.ReactNode }[] = [
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
  },
];

interface SortSelectProps {
  onChange?: (newSort: string, newTimeSort?: string) => void;
}

const SortSelect = ({ onChange }: SortSelectProps) => {
  const router = useRouter();
  const { sort, time } = router.query;

  const [sortType, setSortType] = React.useState<string>('Popular');
  const [timeSort, setTimeSort] = React.useState<string>(time?.toString() ?? 'Today');

  const [showTopOptions, setShowTopOptions] = React.useState<boolean>(false);
  const [showOptions, setShowOptions] = React.useState<boolean>(false);

  const onSortChange = (newValue: string) => {
    if (newValue === 'Top') {
      router.push(`/?sort=${newValue}&time=${timeSort}`, undefined, {
        shallow: true,
      });
      onChange?.(sortTypeMap[newValue as SortType].toString(), topSortTypeMap[timeSort as TopTimeSort].toString());
      setShowOptions(false);
      setTimeout(() => setShowTopOptions(true), 0);
    } else {
      router.push(`/?sort=${newValue}`, undefined, { shallow: true });
      onChange?.(sortTypeMap[newValue as SortType].toString());

      setTimeSort('Today');
      setShowOptions(true);
      setShowTopOptions(false);
    }
    setSortType(newValue);
  };

  const onTimeSortChange = (newValue: string) => {
    setTimeSort(newValue);
    router.push(`/?sort=${sortType}&time=${newValue}`, undefined, {
      shallow: true,
    });
    onChange?.(sortTypeMap[sortType as SortType].toString(), topSortTypeMap[newValue as TopTimeSort].toString());
  };

  React.useEffect(() => {
    if (sort && !Array.isArray(sort)) {
      setSortType(sort);
    }
  }, [sort]);

  return (
    <>
      <Group noWrap>
        <MobileSelect
          data={sortOptions.map((val) => val.value)}
          selectOptions={sortOptions}
          onChange={onSortChange}
          bottomSheetOpened={showOptions}
          defaultActive={sortType}
          styles={{ justify: 'unset', spacing: 'lg' }}
        />
        {(time !== undefined || showTopOptions) && (
          <MobileSelect
            data={topSortOptions.map((val) => val.value)}
            selectOptions={topSortOptions}
            onChange={onTimeSortChange}
            bottomSheetOpened={showTopOptions}
            defaultActive={timeSort}
            styles={{ justify: 'space-between', spacing: 0 }}
          />
        )}
      </Group>
    </>
  );
};

export default SortSelect;
