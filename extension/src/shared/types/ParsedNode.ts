import { WorkTag } from '@src/shared/types/react-types';
import { SvelteBlockType } from '@src/shared/types/svelte-types';
import { Library } from '@src/shared/types/Library';

export type NodeId = number;

export type ParsedNode = ParsedReactNode | ParsedSvelteNode;
export type Root =
	| {
			root: ParsedReactNode;
			library: Library.REACT;
	  }
	| {
			root: ParsedSvelteNode;
			library: Library.SVELTE;
	  };

export type ParsedReactNode = {
	tag: WorkTag;
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

