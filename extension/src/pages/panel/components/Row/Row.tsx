import './Row.scss';

import classNames from 'classnames';
import React, { MouseEvent, useContext, useEffect, useState } from 'react';

import { ExpandArrow } from '@pages/panel/components/ExpandArrow';
import { FilterContext } from '@pages/panel/library-specific/contexts/FilterContext';
import {
	SelectedNodeContext,
	SelectedNodeUpdateContext,
} from '@pages/panel/contexts/SelectedNodeContext';
import { Root } from '@src/shared/types/ParsedNode';
import NodeRowText from '../../library-specific/components/NodeRowText';

export const Row = (props: {
	nodeAndLibrary: Root;
	indent: number;
	handleReportUnfilteredChildren?: () => void;
}) => {
	const { nodeAndLibrary, indent, handleReportUnfilteredChildren } = props;
	const { node, library } = nodeAndLibrary;

	const filterFunc = useContext(FilterContext);
	const updateSelectedNode = useContext(SelectedNodeUpdateContext);
	const selectedNode = useContext(SelectedNodeContext);

	const [isExpanded, setIsExpanded] = useState(true);
	const [hasUnfilteredChildren, setHasUnfilteredChildren] = useState(false);

	const reportUnfilteredChildren = () => {
		if (!hasUnfilteredChildren) {
			handleReportUnfilteredChildren?.();
			setHasUnfilteredChildren(true);
		}
	};

	const handleRowClick = (e: MouseEvent<HTMLElement>) => {
		e.stopPropagation();
		updateSelectedNode(nodeAndLibrary);
	};

	const shouldRender: boolean = filterFunc(nodeAndLibrary);
	if (shouldRender) {
		handleReportUnfilteredChildren?.();
	}

	// TODO: think if there is a better way to do this
	useEffect(() => {
		setHasUnfilteredChildren(false);
	}, [shouldRender]);

	const indentSize = 12 * indent;

	if (shouldRender) {
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
							isExpanded={hasUnfilteredChildren && isExpanded}
							onClick={(expanded) => setIsExpanded(expanded)}
							disabled={!hasUnfilteredChildren}
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
								nodeAndLibrary={{ node: child, library } as Root}
								indent={indent + 1}
								handleReportUnfilteredChildren={reportUnfilteredChildren}
							/>
						))}
					</div>
				)}
			</>
		);
	} else {
		return (
			<>
				{node.children.map((child) => (
					<Row
						key={child.id}
						nodeAndLibrary={{ node: child, library } as Root}
						indent={indent}
						handleReportUnfilteredChildren={reportUnfilteredChildren}
					/>
				))}
			</>
		);
	}
};

