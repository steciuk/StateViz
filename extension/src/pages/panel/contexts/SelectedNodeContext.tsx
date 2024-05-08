import { createContext, useCallback, useState } from 'react';

import { ParsedNode } from '@src/shared/types/ParsedNode';

export const SelectedNodeContext = createContext<ParsedNode | null>(null);
export const SelectedNodeUpdateContext = createContext<
	(node: ParsedNode | null) => void
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const SelectedNodeProvider = (props: { children: React.ReactNode }) => {
	const [selectedNode, setSelectedNode] = useState<ParsedNode | null>(null);

	const updateSelectedNode = useCallback((node: ParsedNode | null) => {
		setSelectedNode(node);
	}, []);

	return (
		<SelectedNodeContext.Provider value={selectedNode}>
			<SelectedNodeUpdateContext.Provider value={updateSelectedNode}>
				{props.children}
			</SelectedNodeUpdateContext.Provider>
		</SelectedNodeContext.Provider>
	);
};

