import { Library } from '@src/shared/types/Library';
import { NodeAndLibrary } from '@src/shared/types/ParsedNode';
import { WorkTag } from '@src/shared/types/react-types';
import React from 'react';

const NodeInspectInfo = (props: { selectedNode: NodeAndLibrary }) => {
	const { node, library } = props.selectedNode;

	const nodeType =
		library === Library.SVELTE ? node.type : getWorkTagLabel(node.type);

	return (
		<>
			<h2 className="text-lg">{node.name}</h2>
			<p>Type: {nodeType}</p>
			<p>ID: {node.id}</p>
		</>
	);
};

function getWorkTagLabel(tag: WorkTag): string {
	return WorkTag[tag] ?? 'Unknown';
}

export default NodeInspectInfo;

