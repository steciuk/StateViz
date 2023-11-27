import React, { useContext, useState } from 'react';

import { FilterContext } from '@pages/panel/contexts/FilterContext';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

const FiberRow = (props: { fiber: ParsedFiber }) => {
	const { fiber } = props;
	const filterSettings = useContext(FilterContext);
	const [isExpanded, setIsExpanded] = useState(true);

	const shouldRender = filterSettings[fiber.tag];

	if (shouldRender) {
		return (
			<div
				style={{
					marginLeft: `${20}px`,
				}}
			>
				<input
					type="checkbox"
					checked={isExpanded}
					onChange={() => setIsExpanded(!isExpanded)}
					disabled={fiber.children.length === 0}
				/>
				{fiber.name + ' - '}
				{fiber.tag + ' - '}
				{fiber.id}
				{isExpanded &&
					fiber.children.map((child) => (
						<FiberRow key={child.id} fiber={child} />
					))}
			</div>
		);
	} else {
		return (
			<div>
				{fiber.children.map((child) => (
					<FiberRow key={child.id} fiber={child} />
				))}
			</div>
		);
	}
};

export default FiberRow;
