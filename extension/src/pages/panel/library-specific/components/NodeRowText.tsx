import { Library } from '@src/shared/types/Library';
import { Root } from '@src/shared/types/ParsedNode';
import React from 'react';

const NodeRowText = (props: { nodeAndLibrary: Root }) => {
	const { nodeAndLibrary } = props;
	const { node, library } = nodeAndLibrary;

	switch (library) {
		case Library.REACT:
			return node.name + ' - ' + node.type + ' - ' + node.id;
		case Library.SVELTE:
			return node.name + ' - ' + node.type + ' - ' + node.id;
	}
};

export default NodeRowText;
