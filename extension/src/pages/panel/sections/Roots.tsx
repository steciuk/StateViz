import { NodeAndLibrary, ParsedNode } from '@src/shared/types/ParsedNode';
import React, {
	Fragment,
	use,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Row } from '@pages/panel/components/Row/Row';
import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import {
	ChromeBridgeMessage,
	ChromeBridgeMessageType,
} from '@src/shared/chrome-messages/ChromeBridge';
import { FilterContext } from '@pages/panel/library-specific/contexts/FilterContext';
import { Library } from '@src/shared/types/Library';

const Roots = () => {
	const filteredNodes = useFilteredNodes();

	if (!filteredNodes) return null;

	//TODO: check if we can use index asd key here
	return filteredNodes.map((root, i) => (
		<div key={i}>
			<p>{root.library}</p>
			{root.nodes.map((node) => (
				<Fragment key={node.id}>
					<Row
						nodeAndLibrary={{ node, library: root.library } as NodeAndLibrary}
						indent={0}
					/>
				</Fragment>
			))}
		</div>
	));
};

export default Roots;

const useRoots = () => {
	const chromeBridge = useContext(ChromeBridgeContext);
	const [fiberRoot, setFiberRoot] = useState<NodeAndLibrary[] | null>(null);

	useEffect(() => {
		const removeChromeMessageListener = chromeBridge.onMessage(
			(message: ChromeBridgeMessage) => {
				if (message.type === ChromeBridgeMessageType.FULL_SKELETON) {
					console.log('Set fiber root');
					setFiberRoot(message.content);
				}
			}
		);

		return () => {
			removeChromeMessageListener();
		};
	}, [chromeBridge]);

	return fiberRoot;
};

const useFilteredNodes = () => {
	const roots = useRoots();
	const filterFunc = useContext(FilterContext);

	const filterOutNodes = useCallback(
		<T extends ParsedNode>(nodes: T[], library: Library): T[] => {
			const result: T[] = [];

			nodes.forEach((node) => {
				const shouldDisplay = filterFunc({ node, library } as NodeAndLibrary);

				if (shouldDisplay) {
					result.push({
						...node,
						children: filterOutNodes(node.children as T[], library),
					});
				} else {
					result.push(...filterOutNodes(node.children as T[], library));
				}
			});

			return result;
		},
		[filterFunc]
	);

	const filteredNodes = useMemo(() => {
		if (!roots) return null;

		return roots.map((root) => ({
			library: root.library,
			nodes: filterOutNodes([root.node], root.library),
		}));
	}, [roots, filterOutNodes]);

	return filteredNodes;
};

