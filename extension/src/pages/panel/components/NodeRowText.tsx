import { ParsedNode } from '@src/shared/types/ParsedNode';

export const NodeRowText = (props: { node: ParsedNode }) => {
	const { node } = props;

	return node.name;
};

