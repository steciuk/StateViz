import { NodeAndLibrary } from '@src/shared/types/ParsedNode';
import React from 'react';
import { Row } from '@pages/panel/components/Row/Row';

const Roots = (props: { roots: NodeAndLibrary[] }) => {
	return props.roots.map((root) => (
		<div key={root.node.id}>
			<p>{root.library}</p>
			<Row nodeAndLibrary={root} indent={0} />
		</div>
	));
};

export default Roots;

