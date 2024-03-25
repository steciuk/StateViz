import React, { useContext, useState } from 'react';

import { Toggle } from '@pages/panel/components/Toggle';
import {
	FilterContext,
	FilterUpdateContext,
} from '@pages/panel/library-specific/contexts/FilterContext';
import { WorkTag } from '@src/shared/types/react-types';
import { Library } from '@src/shared/types/Library';
import { SvelteBlockType } from '@src/shared/types/svelte-types';

const workTagLabels = Object.keys(WorkTag).filter((key) =>
	isNaN(Number(key))
) as Array<keyof typeof WorkTag>;

const svelteTypeLabels = Object.values(SvelteBlockType);

export const FilterSettings = () => {
	const shouldRender = useContext(FilterContext);
	const updateFilter = useContext(FilterUpdateContext);

	const [filterForLibrary, setFilterForLibrary] = useState<Library>(
		Library.REACT
	);

	return (
		<div>
			<h2 className="text-lg">Filter settings</h2>
			<label>
				<span>for </span>
				<select
					onChange={(e) => setFilterForLibrary(e.target.value as Library)}
				>
					{Object.values(Library).map((library) => (
						<option key={library}>{library}</option>
					))}
				</select>
			</label>
			{(() => {
				switch (filterForLibrary) {
					case Library.REACT:
						return workTagLabels.map((label) => (
							<Toggle
								key={label}
								value={shouldRender({
									library: Library.REACT,
									node: { type: WorkTag[label] },
								})}
								onChange={(value) =>
									updateFilter(Library.REACT, WorkTag[label], value)
								}
								label={label}
								type="checkbox"
							/>
						));
					case Library.SVELTE:
						return svelteTypeLabels.map((label) => (
							<Toggle
								key={label}
								value={shouldRender({
									library: Library.SVELTE,
									node: { type: label },
								})}
								onChange={(value) => updateFilter(Library.SVELTE, label, value)}
								label={label}
								type="checkbox"
							/>
						));
				}
			})()}
		</div>
	);
};

