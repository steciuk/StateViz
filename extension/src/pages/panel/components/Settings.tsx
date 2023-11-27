import React, { useContext } from 'react';

import {
	FilterContext,
	FilterUpdateContext,
} from '@pages/panel/contexts/FilterContext';
import { WorkTag } from '@src/shared/types/react-types';

const filterSettingsLabels = Object.keys(WorkTag).filter((key) =>
	isNaN(Number(key))
) as Array<keyof typeof WorkTag>;

const Settings = () => {
	const filterSettings = useContext(FilterContext);
	const updateFilter = useContext(FilterUpdateContext);

	return (
		<div>
			{filterSettingsLabels.map((label) => (
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

export default Settings;
