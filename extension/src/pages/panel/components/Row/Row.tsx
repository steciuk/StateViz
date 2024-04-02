import './Row.scss';

import classNames from 'classnames';
import React, { MouseEvent, useContext, useEffect, useState } from 'react';

import { ExpandArrow } from '@pages/panel/components/ExpandArrow';
import {
	SelectedNodeContext,
	SelectedNodeUpdateContext,
} from '@pages/panel/contexts/SelectedNodeContext';
import { NodeAndLibrary } from '@src/shared/types/ParsedNode';
import NodeRowText from '../../library-specific/components/NodeRowText';

export const Row = (props: {
	nodeAndLibrary: NodeAndLibrary;
	indent: number;
}) => {
	const { nodeAndLibrary, indent } = props;
	const { node, library } = nodeAndLibrary;

	const updateSelectedNode = useContext(SelectedNodeUpdateContext);
	const selectedNode = useContext(SelectedNodeContext);

	const [isExpanded, setIsExpanded] = useState(true);

	const handleRowClick = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		updateSelectedNode(nodeAndLibrary);
	};

	const indentSize = 12 * indent;

	return (
		<>
			<div
				className={classNames('fiber-row whitespace-nowrap hover:bg-accent', {
					'bg-secondary': selectedNode?.node.id === node.id,
				})}
				onClick={handleRowClick}
			>
				<div className={`ml-[${indentSize}px]`}>
					<ExpandArrow
						isExpanded={isExpanded && node.children.length > 0}
						onClick={(expanded) => setIsExpanded(expanded)}
						disabled={node.children.length === 0}
						className="mr-1"
					/>
					<span className="cursor-default">
						<NodeRowText nodeAndLibrary={nodeAndLibrary} />
					</span>
				</div>
			</div>
			{isExpanded && (
				<div className={classNames('children-wrapper', 'relative')}>
					<div
						className={classNames(
							'vertical-bar pointer-events-none absolute bottom-0 top-0 z-10 w-0.5 bg-secondary',
							`left-[${indentSize + 3}px]`
						)}
					/>
					{node.children.map((child) => (
						<Row
							key={child.id}
							nodeAndLibrary={{ node: child, library } as NodeAndLibrary}
							indent={indent + 1}
						/>
					))}
				</div>
			)}
		</>
	);
};

