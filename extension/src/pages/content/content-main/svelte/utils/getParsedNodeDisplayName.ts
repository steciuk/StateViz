import { ParsedSvelteNode } from '@src/shared/types/ParsedNode';
import { SvelteBlockType } from '@src/shared/types/svelte-types';

export function getParsedNodeDisplayName(
	node: Pick<ParsedSvelteNode, 'type' | 'name'>
): string {
	switch (node.type) {
		case SvelteBlockType.anchor:
			return '#anchor';
		case SvelteBlockType.element:
			return `<${node.name}>`;
		case SvelteBlockType.text:
			return `"${node.name}"`;
		case SvelteBlockType.each:
		case SvelteBlockType.if:
		case SvelteBlockType.else:
		case SvelteBlockType.then:
		case SvelteBlockType.catch:
		case SvelteBlockType.pending:
		case SvelteBlockType.key:
		case SvelteBlockType.slot:
			return `{#${node.name}}`;
		default:
			return node.name;
	}
}

