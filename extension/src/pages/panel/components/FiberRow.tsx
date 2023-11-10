import React, { useState } from 'react';

import { ParsedFiber } from '@src/shared/types/ParsedFiber';

const FiberRow = (props: { fiber: ParsedFiber }) => {
	const { fiber } = props;
	const [isExpanded, setIsExpanded] = useState(false);

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
			{fiber.name}
			{isExpanded &&
				fiber.children.map((child, i) => <FiberRow key={i} fiber={child} />)}
		</div>
	);
};

export default FiberRow;
