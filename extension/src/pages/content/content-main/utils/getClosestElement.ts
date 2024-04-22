export function getClosestElement(node: Node): Element | null {
	if (node.nodeType === Node.ELEMENT_NODE) {
		return node as Element;
	}

	return node.parentElement;
}

