import React, { createContext, useState } from 'react';

import { WorkTag } from '@src/shared/types/react-types';

type FilterSettings = {
	[key in WorkTag]: boolean;
};

const defaultFilterSettings: FilterSettings = {
	[WorkTag.FunctionComponent]: true,
	[WorkTag.ClassComponent]: true,
	[WorkTag.IndeterminateComponent]: true,
	[WorkTag.HostRoot]: true,
	[WorkTag.HostPortal]: false,
	[WorkTag.HostComponent]: false,
	[WorkTag.HostText]: false,
	[WorkTag.Fragment]: false,
	[WorkTag.Mode]: false,
	[WorkTag.ContextConsumer]: true,
	[WorkTag.ContextProvider]: true,
	[WorkTag.ForwardRef]: true,
	[WorkTag.Profiler]: true,
	[WorkTag.SuspenseComponent]: false,
	[WorkTag.MemoComponent]: true,
	[WorkTag.SimpleMemoComponent]: true,
	[WorkTag.LazyComponent]: true,
	[WorkTag.IncompleteClassComponent]: true,
	[WorkTag.DehydratedFragment]: true,
	[WorkTag.SuspenseListComponent]: true,
	[WorkTag.ScopeComponent]: true,
	[WorkTag.OffscreenComponent]: false,
	[WorkTag.LegacyHiddenComponent]: false,
	[WorkTag.CacheComponent]: true,
	[WorkTag.TracingMarkerComponent]: true,
	[WorkTag.HostHoistable]: true,
	[WorkTag.HostSingleton]: true,
};

export const FilterContext = createContext(defaultFilterSettings);
export const FilterUpdateContext = createContext<
	(tag: WorkTag, value: boolean) => void
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const FilterProvider = (props: { children: React.ReactNode }) => {
	const [filterSettings, setFilterSettings] = useState<FilterSettings>(
		defaultFilterSettings
	);

	const updateSettings = (tag: WorkTag, value: boolean) => {
		setFilterSettings((prev) => ({
			...prev,
			[tag]: value,
		}));
	};

	return (
		<FilterContext.Provider value={filterSettings}>
			<FilterUpdateContext.Provider value={updateSettings}>
				{props.children}
			</FilterUpdateContext.Provider>
		</FilterContext.Provider>
	);
};
