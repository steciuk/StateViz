import './Row.scss';

import classNames from 'classnames';
import {
	MouseEvent,
	memo,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react';

import { ExpandArrow } from '@pages/panel/components/ExpandArrow';
import {
	SelectedNodeContext,
	SelectedNodeUpdateContext,
} from '@pages/panel/contexts/SelectedNodeContext';
import { NodeId, ParsedNode } from '@src/shared/types/ParsedNode';
import { usePrevious } from '@src/shared/hooks/usePrevious';
import { ChromeBridgeContext } from '@pages/panel/contexts/ChromeBridgeContext';
import { ChromeBridgeMessageType } from '@src/shared/chrome-messages/ChromeBridge';
import useStorage from '@src/shared/hooks/useStorage';
import indentSizeStorage from '@pages/panel/storages/indentSizeStorage';
import { NodeRowText } from '@pages/panel/components/NodeRowText';
import { ExpandContext } from '@pages/panel/contexts/ExpandContext';

export const Row = (props: { node: ParsedNode; level: number }) => {
	const indentSize = useStorage(indentSizeStorage);
	const { node, level } = props;

	const updateSelectedNode = useContext(SelectedNodeUpdateContext);
	const selectedNode = useContext(SelectedNodeContext);

	const [isExpanded, setIsExpanded] = useState(true);
	const expand = useCallback((expand: boolean) => setIsExpanded(expand), []);
	useExpandAllSignal(isExpanded, expand);

	const handleRowClick = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		updateSelectedNode(node);
	};

	const handleHover = useSendHover();

	const indent = indentSize * level;

	return (
		<>
			<div
				className={classNames('fiber-row whitespace-nowrap hover:bg-accent', {
					'bg-secondary': selectedNode?.id === node.id,
				})}
				onClick={handleRowClick}
				onMouseEnter={() => handleHover(node.id)}
			>
				<div className={`ml-[${indent}px]`}>
					<ExpandArrow
						isExpanded={isExpanded && node.children.length > 0}
						onClick={(expanded) => setIsExpanded(expanded)}
						disabled={node.children.length === 0}
						className="mr-1"
					/>
					<span className="cursor-default">
						<NodeRowText node={node} />
					</span>
				</div>
			</div>

			{/* TODO: would it be better to not render collapsed components at all?
          - More performant if large subtree is collapsed
          - State lost on expand
          - Less performant on expand and collapse
        */}
			<div
				className={classNames('children-wrapper', 'relative', {
					hidden: !isExpanded,
				})}
			>
				<div
					className={classNames(
						'vertical-bar pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 bg-secondary',
						`left-[${indent + 3}px]`
					)}
				/>
				{node.children.map((child) => (
					<MemoRow key={child.id} node={child} level={level + 1} />
				))}
			</div>
		</>
	);
};

const MemoRow = memo(Row);

function useExpandAllSignal(
	isExpanded: boolean,
	expand: (expand: boolean) => void
): void {
	const expandAll = useContext(ExpandContext);
	const prevExpandAll = usePrevious(expandAll);

	useEffect(() => {
		if (prevExpandAll === undefined) return;
		if (expandAll === prevExpandAll) return;
		if (expandAll.value !== isExpanded) {
			expand(expandAll.value);
		}
	}, [expandAll, prevExpandAll, expand, isExpanded]);
}

function useSendHover(): (nodeId: NodeId) => void {
	const chromeBridge = useContext(ChromeBridgeContext);

	return useCallback(
		(nodeId: NodeId) => {
			chromeBridge.send({
				type: ChromeBridgeMessageType.HOVER_ELEMENT,
				content: nodeId,
			});
		},
		[chromeBridge]
	);
}

