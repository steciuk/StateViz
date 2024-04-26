import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';
import React from 'react';

const NodeInspectInfo = (props: { selectedNode: NodeInspectedData }) => {
	const { nodeInfo, name, id } = props.selectedNode;

	return (
		<>
			<h2 className="text-lg">{name}</h2>
			{nodeInfo.map((info, i) => (
				<p key={i}>
					{info.label}: {info.value}
				</p>
			))}
			<p>ID: {id}</p>
		</>
	);
};

export default NodeInspectInfo;

