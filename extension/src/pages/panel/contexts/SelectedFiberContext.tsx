import { createContext, useCallback, useState } from 'react';

import { ParsedReactNode } from '@src/shared/types/ParsedNode';

export const SelectedFiberContext = createContext<ParsedReactNode | null>(null);
export const SelectedFiberUpdateContext = createContext<
	(fiber: ParsedReactNode | null) => void
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const SelectedFiberProvider = (props: { children: React.ReactNode }) => {
	const [selectedFiber, setSelectedFiber] = useState<ParsedReactNode | null>(null);

	const updateSelectedFiber = useCallback((fiber: ParsedReactNode | null) => {
		setSelectedFiber(fiber);
	}, []);

	return (
		<SelectedFiberContext.Provider value={selectedFiber}>
			<SelectedFiberUpdateContext.Provider value={updateSelectedFiber}>
				{props.children}
			</SelectedFiberUpdateContext.Provider>
		</SelectedFiberContext.Provider>
	);
};
