import React, { useContext } from 'react';

import { Toggle } from '@pages/panel/components/Toggle';
import {
	FilterContext,
	FilterUpdateContext,
} from '@pages/panel/contexts/FilterContext';
import { workTagLabels } from '@pages/panel/utils/work-tag';
import { WorkTag } from '@src/shared/types/react-types';

export const FilterSettings = () => {
	const filterSettings = useContext(FilterContext);
	const updateFilter = useContext(FilterUpdateContext);

	return (
		<div>
			<h2 className="text-lg">Show elements</h2>
			{workTagLabels.map((label) => (
				<Toggle
					key={label}
					value={filterSettings[WorkTag[label]]}
					onChange={(value) => updateFilter(WorkTag[label], value)}
					label={label}
					type="checkbox"
				/>
			))}
		</div>
	);
};
