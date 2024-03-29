import React, { createContext, useCallback, useState } from 'react';

import { WorkTag } from '@src/shared/types/react-types';
import { NodeAndLibrary } from '@src/shared/types/ParsedNode';
import { SvelteBlockType } from '@src/shared/types/svelte-types';
import { Library } from '@src/shared/types/Library';

const defaultReactFilterSettings: { [key in WorkTag]: boolean } = {
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
} as const;

const defaultSvelteFilterSettings: { [key in SvelteBlockType]: boolean } = {
	[SvelteBlockType.anchor]: false,
	[SvelteBlockType.block]: false,
	[SvelteBlockType.catch]: false,
	[SvelteBlockType.component]: true,
	[SvelteBlockType.each]: false,
	[SvelteBlockType.element]: false,
	[SvelteBlockType.else]: false,
	[SvelteBlockType.if]: false,
	[SvelteBlockType.iteration]: false,
	[SvelteBlockType.key]: false,
	[SvelteBlockType.pending]: false,
	[SvelteBlockType.slot]: false,
	[SvelteBlockType.text]: false,
	[SvelteBlockType.then]: false,
} as const;

type SettingIdentifier<T extends Library> = T extends Library.REACT
	? WorkTag
	: T extends Library.SVELTE
	  ? SvelteBlockType
	  : never;

type FilterDifferentiatorHelper<T extends NodeAndLibrary> =
	T extends NodeAndLibrary
		? { library: T['library'] } & { node: Pick<T['node'], 'type'> }
		: never;

type FilterDifferentiator = FilterDifferentiatorHelper<NodeAndLibrary>;

export const FilterContext = createContext<
	(nodeAndLibrary: FilterDifferentiator) => boolean
>((_nodeAndLibrary: FilterDifferentiator) => true);
export const FilterUpdateContext = createContext<
	<T extends Library>(
		library: T,
		key: SettingIdentifier<T>,
		value: boolean
	) => void
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const FilterProvider = (props: { children: React.ReactNode }) => {
	// const [filterSettings, setFilterSettings] = useState<typeof defaultFilterSettings>(
	// 	defaultFilterSettings
	// );

	const [reactFilterSettings, setReactFilterSettings] = useState(
		defaultReactFilterSettings
	);
	const [svelteFilterSettings, setSvelteFilterSettings] = useState(
		defaultSvelteFilterSettings
	);

	const updateSettings = useCallback(
		<T extends Library>(
			library: T,
			key: SettingIdentifier<T>,
			value: boolean
		) => {
			switch (library) {
				case Library.REACT:
					setReactFilterSettings((prev) => ({
						...prev,
						[key]: value,
					}));
					break;
				case Library.SVELTE:
					setSvelteFilterSettings((prev) => ({
						...prev,
						[key]: value,
					}));
					break;
			}
		},
		[]
	);

	const shouldRender = useCallback(
		(nodeAndLibrary: FilterDifferentiator) => {
			const { library, node } = nodeAndLibrary;
			switch (library) {
				case Library.REACT: {
					const a = reactFilterSettings[node.type];
					console.log(nodeAndLibrary, a);
					return reactFilterSettings[node.type] ?? true;
				}
				case Library.SVELTE:
					return svelteFilterSettings[node.type] ?? true;
			}
		},
		[reactFilterSettings, svelteFilterSettings]
	);

	return (
		<FilterContext.Provider value={shouldRender}>
			<FilterUpdateContext.Provider value={updateSettings}>
				{props.children}
			</FilterUpdateContext.Provider>
		</FilterContext.Provider>
	);
};

