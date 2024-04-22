import { Library } from '@src/shared/types/Library';
import {
	NodeAndLibrary,
	ParsedReactNode,
	ParsedSvelteNode,
} from '@src/shared/types/ParsedNode';
import React from 'react';

const NodeRowText = (props: { nodeAndLibrary: NodeAndLibrary }) => {
	const { nodeAndLibrary } = props;
	const { node, library } = nodeAndLibrary;

	switch (library) {
		case Library.REACT:
			return <ReactNodeRowText node={node} />;
		case Library.SVELTE:
			return <SvelteNodeRowText node={node} />;
	}
};

const ReactNodeRowText = (props: { node: ParsedReactNode }) => {
	const { node } = props;

	return node.name;
};

const SvelteNodeRowText = (props: { node: ParsedSvelteNode }) => {
	const { node } = props;

	return node.name;
};

export default NodeRowText;

