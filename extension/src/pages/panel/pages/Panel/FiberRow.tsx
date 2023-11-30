import React, { MouseEvent, useContext, useEffect, useState } from 'react';

import { ExpandArrow } from '@pages/panel/components/ExpandArrow';
import { FilterContext } from '@pages/panel/contexts/FilterContext';
import { SelectedFiberUpdateContext } from '@pages/panel/contexts/SelectedFiberContext';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export const FiberRow = (props: {
	fiber: ParsedFiber;
	indent: number;
	handleReportUnfilteredChildren?: () => void;
}) => {
	const { fiber, indent, handleReportUnfilteredChildren } = props;
	const filterSettings = useContext(FilterContext);
	const updateSelectedFiber = useContext(SelectedFiberUpdateContext);

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
		updateSelectedFiber(fiber);
	};

	const shouldRender = filterSettings[fiber.tag] ?? true;
	if (shouldRender) {
		handleReportUnfilteredChildren?.();
	}

	// TODO: think if there is a better way to do this
	useEffect(() => {
		setHasUnfilteredChildren(false);
	}, [filterSettings]);

	const displayText = fiber.name + ' - ' + fiber.tag + ' - ' + fiber.id;

	if (shouldRender) {
		return (
			<>
				<div
					className="whitespace-nowrap hover:bg-secondary"
					onClick={handleRowClick}
				>
					<div className={`ml-[${indent * 10}px]`}>
						<ExpandArrow
							isExpanded={hasUnfilteredChildren && isExpanded}
							onClick={(expanded) => setIsExpanded(expanded)}
							disabled={!hasUnfilteredChildren}
							className="mr-1"
						/>
						<span>{displayText}</span>
					</div>
				</div>
				{isExpanded &&
					fiber.children.map((child) => (
						<FiberRow
							key={child.id}
							fiber={child}
							indent={indent + 1}
							handleReportUnfilteredChildren={reportUnfilteredChildren}
						/>
					))}
			</>
		);
	} else {
		return (
			<>
				{fiber.children.map((child) => (
					<FiberRow
						key={child.id}
						fiber={child}
						indent={indent}
						handleReportUnfilteredChildren={reportUnfilteredChildren}
					/>
				))}
			</>
		);
	}
};
