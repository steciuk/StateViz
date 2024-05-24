import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';

import { ParsedNode } from '@src/shared/types/ParsedNode';
import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';

export const SelectedNodeContext = createContext<ParsedNode | null>(null);
export const SelectedNodeUpdateContext = createContext<
	(node: ParsedNode | null) => void
	// eslint-disable-next-line @typescript-eslint/no-empty-function
>(() => {});

export const SelectedNodeProvider = (props: { children: React.ReactNode }) => {
	const { isBridgeConnected } = useContext(ChromeBridgeContext);
	const [selectedNode, setSelectedNode] = useState<ParsedNode | null>(null);

	const updateSelectedNode = useCallback((node: ParsedNode | null) => {
		setSelectedNode(node);
	}, []);

	useEffect(() => {
		const deselectFiberOnPageReload = () => {
			setSelectedNode(null);
		};

		chrome.devtools.network.onNavigated.addListener(deselectFiberOnPageReload);

		return () => {
			chrome.devtools.network.onNavigated.removeListener(
				deselectFiberOnPageReload
			);
		};
	}, []);

	useEffect(() => {
		if (!isBridgeConnected) {
			setSelectedNode(null);
		}
	}, [isBridgeConnected]);

	return (
		<SelectedNodeContext.Provider value={selectedNode}>
			<SelectedNodeUpdateContext.Provider value={updateSelectedNode}>
				{props.children}
			</SelectedNodeUpdateContext.Provider>
		</SelectedNodeContext.Provider>
	);
};

