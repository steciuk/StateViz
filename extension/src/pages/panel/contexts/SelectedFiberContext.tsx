import { createContext, useState } from 'react';

import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export const SelectedFiberContext = createContext<ParsedFiber | null>(null);
export const SelectedFiberUpdateContext = createContext<
	(fiber: ParsedFiber | null) => void
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const SelectedFiberProvider = (props: { children: React.ReactNode }) => {
	const [selectedFiber, setSelectedFiber] = useState<ParsedFiber | null>(null);

	const updateSelectedFiber = (fiber: ParsedFiber | null) => {
		setSelectedFiber(fiber);
	};

	return (
		<SelectedFiberContext.Provider value={selectedFiber}>
			<SelectedFiberUpdateContext.Provider value={updateSelectedFiber}>
				{props.children}
			</SelectedFiberUpdateContext.Provider>
		</SelectedFiberContext.Provider>
	);
};
