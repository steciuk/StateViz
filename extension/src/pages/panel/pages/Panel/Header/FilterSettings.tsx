import React, { useContext } from 'react';

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
				<div key={label}>
					<input
						type="checkbox"
						checked={filterSettings[WorkTag[label]]}
						onChange={(e) => updateFilter(WorkTag[label], e.target.checked)}
					/>
					{label}
				</div>
			))}
		</div>
	);
};
