import React, { useContext, useEffect, useState } from 'react';

import { ExpandArrow } from '@pages/panel/components/ExpandArrow';
import { FilterContext } from '@pages/panel/contexts/FilterContext';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export const FiberRow = (props: {
	fiber: ParsedFiber;
	handleReportUnfilteredChildren?: () => void;
}) => {
	const { fiber, handleReportUnfilteredChildren } = props;
	const filterSettings = useContext(FilterContext);

	const [isExpanded, setIsExpanded] = useState(true);
	const [hasUnfilteredChildren, setHasUnfilteredChildren] = useState(false);

	const reportUnfilteredChildren = () => {
		if (!hasUnfilteredChildren) {
			handleReportUnfilteredChildren?.();
			setHasUnfilteredChildren(true);
		}
	};

	const shouldRender = filterSettings[fiber.tag];
	if (shouldRender) {
		handleReportUnfilteredChildren?.();
	}

	// TODO: think if there is a better way to do this
	useEffect(() => {
		setHasUnfilteredChildren(false);
	}, [filterSettings]);

	if (shouldRender) {
		return (
			<div>
				<ExpandArrow
					isExpanded={hasUnfilteredChildren && isExpanded}
					onClick={(expanded) => setIsExpanded(expanded)}
					disabled={!hasUnfilteredChildren}
				/>
				{fiber.name + ' - '}
				{fiber.tag + ' - '}
				{fiber.id}
				{isExpanded &&
					fiber.children.map((child) => (
						<div key={child.id} className="ml-5">
							<FiberRow
								fiber={child}
								handleReportUnfilteredChildren={reportUnfilteredChildren}
							/>
						</div>
					))}
			</div>
		);
	} else {
		return (
			<>
				{fiber.children.map((child) => (
					<FiberRow
						key={child.id}
						fiber={child}
						handleReportUnfilteredChildren={reportUnfilteredChildren}
					/>
				))}
			</>
		);
	}
};
