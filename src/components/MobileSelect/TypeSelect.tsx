import * as React from 'react';
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
	const onTypeChange = (newType: string) => {
		onChange(newType as StatusTypeSort);
	};

	return (
		<>
			<MobileSelect
				data={typeOptions.map((val) => val.value)}
				selectOptions={typeOptions}
				onChange={onTypeChange}
				defaultActive={'All'}
				styles={{ justify: 'unset', spacing: 'lg' }}
			/>
		</>
	);
};

export default TypeSelect;
