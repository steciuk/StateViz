import { SvelteBlockType } from '@src/shared/types/svelte-types';

export function getNodeTypeName(
	node: Node
): [type: SvelteBlockType, name: string] {
	const type =
		node.nodeType === Node.ELEMENT_NODE
			? SvelteBlockType.element
			: node.nodeValue && node.nodeValue !== ' '
			  ? SvelteBlockType.text
			  : SvelteBlockType.anchor;

	switch (type) {
		case SvelteBlockType.anchor:
			return [type, '#anchor'];
		case SvelteBlockType.text:
			return [type, node.nodeValue ?? node.nodeName.toLowerCase()];
		default:
			return [type, node.nodeName.toLowerCase()];
	}
}

