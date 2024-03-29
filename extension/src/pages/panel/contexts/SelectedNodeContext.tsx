import { createContext, useCallback, useState } from 'react';

import { NodeAndLibrary } from '@src/shared/types/ParsedNode';

export const SelectedNodeContext = createContext<NodeAndLibrary | null>(null);
export const SelectedNodeUpdateContext = createContext<
	(Root: NodeAndLibrary | null) => void
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const SelectedNodeProvider = (props: { children: React.ReactNode }) => {
	const [selectedNode, setSelectedNode] = useState<NodeAndLibrary | null>(null);

	const updateSelectedNode = useCallback((id: NodeAndLibrary | null) => {
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

