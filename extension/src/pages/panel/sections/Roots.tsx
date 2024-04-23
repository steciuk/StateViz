import { NodeAndLibrary, ParsedNode } from '@src/shared/types/ParsedNode';
import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
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
	return (
		<div className="space-y-2">
			{filteredNodes.map((root, i) => (
				<div key={i}>
					<h2 className="text-center text-lg">{root.library}</h2>
					{root.nodes.map((node) => (
						<Fragment key={node.id}>
							<Row
								nodeAndLibrary={
									{ node, library: root.library } as NodeAndLibrary
								}
								level={0}
							/>
						</Fragment>
					))}
				</div>
			))}
		</div>
	);
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

	const filteredNodes = useMemo(() => {
		if (!roots) return null;

		// TODO: think of some solution for removing those type assertions
		const filterOutNodes = <T extends Library>(
			nodes: ParsedNode<T>[],
			library: T
		): ParsedNode<T>[] => {
			const result: ParsedNode<T>[] = [];

			nodes.forEach((node) => {
				const shouldDisplay = filterFunc({ node, library } as NodeAndLibrary);

				if (shouldDisplay) {
					result.push({
						...node,
						children: filterOutNodes(node.children as ParsedNode<T>[], library),
					});
				} else {
					result.push(
						...filterOutNodes(node.children as ParsedNode<T>[], library)
					);
				}
			});

			return result;
		};

		return roots.map((root) => ({
			library: root.library,
			nodes: filterOutNodes([root.node], root.library),
		}));
	}, [roots, filterFunc]);

	return filteredNodes;
};

