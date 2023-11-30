import React from 'react';

import { getWorkTagLabel } from '@pages/panel/utils/work-tag';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

const InspectWindow = (props: { fiber: ParsedFiber }) => {
	const { fiber } = props;

	return (
		<div className="p-2">
			<h2 className="text-lg">Inspect window</h2>
			<p>Name: {fiber.name}</p>
			<p>Tag: {fiber.tag}</p>
			<p>Type: {getWorkTagLabel(fiber.tag)}</p>
			<p>ID: {fiber.id}</p>
		</div>
	);
};

export default InspectWindow;
