import React, { useContext, useState } from 'react';

import { FilterContext } from '@pages/panel/contexts/FilterContext';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export const FiberRow = (props: { fiber: ParsedFiber }) => {
	const { fiber } = props;
	const filterSettings = useContext(FilterContext);
	const [isExpanded, setIsExpanded] = useState(true);

	const shouldRender = filterSettings[fiber.tag];

	if (shouldRender) {
		return (
			<div>
				<input
					type="checkbox"
					checked={isExpanded}
					onChange={() => setIsExpanded(!isExpanded)}
					disabled={fiber.children.length === 0}
				/>
				{fiber.name + ' - '}
				{fiber.tag + ' - '}
				{fiber.id}
				{isExpanded && <FiberChildren fibers={fiber.children} indent={true} />}
			</div>
		);
	} else {
		return <FiberChildren fibers={fiber.children} />;
	}
};

const FiberChildren = (props: { fibers: ParsedFiber[]; indent?: boolean }) => {
	return (
		<div>
			{props.fibers.map((fiber) => (
				<div key={fiber.id} className={props.indent ? 'ml-5' : ''}>
					<FiberRow fiber={fiber} />
				</div>
			))}
		</div>
	);
};
