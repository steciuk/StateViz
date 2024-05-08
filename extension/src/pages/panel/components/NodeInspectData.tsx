import { NodeStateValue } from '@pages/panel/components/NodeStateValue';
import { InspectData } from '@src/shared/types/DataType';
import { NodeInspectedData } from '@src/shared/types/NodeInspectedData';
import React, { Fragment } from 'react';

const NodeInspectData = (props: { inspectData: NodeInspectedData }) => {
	const { nodeData } = props.inspectData;

	return (
		<>
			{nodeData.map(
				(group, index) =>
					group.data.length > 0 && (
						<div key={index}>
							<p className="font-semibold">{group.group}</p>
							{group.data.map((data, i) => (
								<Fragment key={i}>
									<NodeStateRecord label={data.label} value={data.value} />
								</Fragment>
							))}
						</div>
					)
			)}
		</>
	);
};

const NodeStateRecord = (props: { label: string; value: InspectData }) => {
	return (
		<div className="border-b-1 border-secondary">
			<span>{props.label}</span>
			<span className="font-mono">
				: <NodeStateValue inspectData={props.value} />
			</span>
		</div>
	);
};

export default NodeInspectData;

