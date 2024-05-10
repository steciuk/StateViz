import { describe, expect, it } from 'vitest';
import { getClosestElement } from './getClosestElement';

describe('getClosestElement', () => {
	it('should return the element itself if it is an Element node', () => {
		const element = document.createElement('div');
		const result = getClosestElement(element);
		expect(result).toBe(element);
	});

	it('should return the parent element if the node is not an Element node', () => {
		const textNode = document.createTextNode('text');
		const parentElement = document.createElement('div');
		parentElement.appendChild(textNode);
		const result = getClosestElement(textNode);
		expect(result).toBe(parentElement);
	});

	it('should return null if the node has no parent element', () => {
		const node = document.createTextNode('text');
		const result = getClosestElement(node);
		expect(result).toBe(null);
	});
});

