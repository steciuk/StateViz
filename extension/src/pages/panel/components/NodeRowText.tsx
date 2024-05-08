import { NodeAndLibrary } from '@src/shared/types/ParsedNode';

export const NodeRowText = (props: { nodeAndLibrary: NodeAndLibrary }) => {
	const { nodeAndLibrary } = props;
	const { node } = nodeAndLibrary;

	return node.name;
};

