import { createContext, useCallback, useState } from 'react';

import { Root } from '@src/shared/types/ParsedNode';

export const SelectedNodeContext = createContext<Root | null>(null);
export const SelectedNodeUpdateContext = createContext<
	(Root: Root | null) => void
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const SelectedNodeProvider = (props: { children: React.ReactNode }) => {
	const [selectedNode, setSelectedNode] = useState<Root | null>(null);

	const updateSelectedNode = useCallback((id: Root | null) => {
		setSelectedNode(id);
	}, []);

	return (
		<SelectedNodeContext.Provider value={selectedNode}>
			<SelectedNodeUpdateContext.Provider value={updateSelectedNode}>
				{props.children}
			</SelectedNodeUpdateContext.Provider>
		</SelectedNodeContext.Provider>
	);
};
