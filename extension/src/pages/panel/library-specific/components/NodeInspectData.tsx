import { NodeStateValue } from '@pages/panel/components/NodeStateValue';
import {
	InspectData,
	NodeInspectedData,
	ReactInspectedData,
	SvelteInspectedData,
} from '@src/shared/types/DataType';
import { Library } from '@src/shared/types/Library';
import React, { Fragment } from 'react';

const NodeInspectData = (props: { inspectData: NodeInspectedData }) => {
	const { library } = props.inspectData;

	switch (library) {
		case Library.REACT:
			return (
				<ReactNodeInspectData
					inspectData={props.inspectData as ReactInspectedData}
				/>
			);
		case Library.SVELTE:
			return (
				<SvelteNodeInspectData
					inspectData={props.inspectData as SvelteInspectedData}
				/>
			);
	}
};

const ReactNodeInspectData = (props: { inspectData: ReactInspectedData }) => {
	const inspectData = props.inspectData;

	return (
		<>
			{Object.keys(inspectData.props).length > 0 && (
				<div>
					<p className="font-semibold">Props</p>
					{Object.entries(inspectData.props).map(([key, value]) => (
						<Fragment key={key}>
							<NodeStateRecord label={key} value={value} />
						</Fragment>
					))}
				</div>
			)}
			{inspectData.hooks.length > 0 && (
				<div>
					<p className="font-semibold">Hooks</p>
					{inspectData.hooks.map((hook, index) => (
						<Fragment key={index}>
							<NodeStateRecord label={hook.hookType} value={hook.data} />
						</Fragment>
					))}
				</div>
			)}
		</>
	);
};

const SvelteNodeInspectData = (props: { inspectData: SvelteInspectedData }) => {
	const inspectData = props.inspectData;

	return (
		<>
			{Object.keys(inspectData.props).length > 0 && (
				<div>
					<p className="font-semibold">Props</p>
					{Object.entries(inspectData.props).map(([key, value]) => (
						<Fragment key={key}>
							<NodeStateRecord label={key} value={value} />
						</Fragment>
					))}
				</div>
			)}
			{Object.keys(inspectData.state).length > 0 && (
				<div>
					<p className="font-semibold">State</p>
					{Object.entries(inspectData.state).map(([key, value]) => (
						<Fragment key={key}>
							<NodeStateRecord label={key} value={value} />
						</Fragment>
					))}
				</div>
			)}
		</>
	);
};

const NodeStateRecord = (props: { label: string; value: InspectData }) => {
	return (
		<div className="border-b-1 border-secondary">
			<span>{props.label}: </span>
			<span className="font-mono">
				<NodeStateValue inspectData={props.value} />
			</span>
		</div>
	);
};

export default NodeInspectData;

