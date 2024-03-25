import { WorkTag } from '@src/shared/types/react-types';
import { SvelteBlockType } from '@src/shared/types/svelte-types';
import { Library } from '@src/shared/types/Library';

export type NodeId = string;

export type ParsedNode = ParsedReactNode | ParsedSvelteNode;
export type Root =
	| {
			node: ParsedReactNode;
			library: Library.REACT;
	  }
	| {
			node: ParsedSvelteNode;
			library: Library.SVELTE;
	  };

export type ParsedReactNode = {
	type: WorkTag;
	name: string;
	children: ParsedReactNode[];
	id: NodeId;
};

export type ParsedSvelteNode = {
	type: SvelteBlockType;
	name: string;
	children: ParsedSvelteNode[];
	id: NodeId;
};

