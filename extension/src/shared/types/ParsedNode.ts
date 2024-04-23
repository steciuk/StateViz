import { WorkTag } from '@src/shared/types/react-types';
import { SvelteBlockType } from '@src/shared/types/svelte-types';
import { Library } from '@src/shared/types/Library';

export type NodeId = string;

export type ParsedNode<T extends Library = Library> = T extends Library.REACT
	? ParsedReactNode
	: T extends Library.SVELTE
	  ? ParsedSvelteNode
	  : never;

// discriminated union unless library specified
export type NodeAndLibrary<T extends Library = Library> = {
	[K in T]: {
		node: ParsedNode<K>;
		library: K;
	};
}[T];

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

