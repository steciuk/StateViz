import { getParsedNodeDisplayName } from '@pages/content/content-main/svelte/utils/getParsedNodeDisplayName';
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

	const name = getName(node, type);
	const displayName = getParsedNodeDisplayName({ type, name });

	return [type, displayName];
}

function getName(node: Node, type: SvelteBlockType) {
	switch (type) {
		case SvelteBlockType.anchor:
			return '#anchor';
		case SvelteBlockType.text:
			return node.nodeValue ?? node.nodeName.toLowerCase();
		default:
			return node.nodeName.toLowerCase();
	}
}

