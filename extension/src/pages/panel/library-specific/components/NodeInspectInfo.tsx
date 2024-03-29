import { NodeInspectedData } from '@src/shared/types/DataType';
import { Library } from '@src/shared/types/Library';
import { WorkTag } from '@src/shared/types/react-types';
import React from 'react';

const NodeInspectInfo = (props: { selectedNode: NodeInspectedData }) => {
	const { type, name, id, library } = props.selectedNode;

	const nodeType = library === Library.SVELTE ? type : getWorkTagLabel(type);

	return (
		<>
			<h2 className="text-lg">{name}</h2>
			<p>Type: {nodeType}</p>
			<p>ID: {id}</p>
		</>
	);
};

function getWorkTagLabel(tag: WorkTag): string {
	return WorkTag[tag] ?? 'Unknown';
}

export default NodeInspectInfo;

