/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { getNodeTypeName, exportedForTest } from './getNodeTypeName';
import { SvelteBlockType } from '@src/shared/types/svelte-types';

const { getName } = exportedForTest;

describe('getNodeTypeName', () => {
	it('should return the correct type and name for an element node', () => {
		const node = document.createElement('div');
		const result = getNodeTypeName(node as any);
		expect(result).toEqual([SvelteBlockType.element, '<div>']);
	});

	it('should return the correct type and name for a text node', () => {
		const node = document.createTextNode('Hello');
		const result = getNodeTypeName(node as any);
		expect(result).toEqual([SvelteBlockType.text, '"Hello"']);
	});
});

describe('getName', () => {
	it('should return "#anchor" for an anchor node', () => {
		const result = getName({} as any, SvelteBlockType.anchor);
		expect(result).toBe('#anchor');
	});

	it('should return the node value for a text node', () => {
		const node = document.createTextNode('Hello');
		const result = getName(node as any, SvelteBlockType.text);
		expect(result).toBe('Hello');
	});

	it('should return the node name for other node types', () => {
		const node = document.createElement('div');
		const result = getName(node as any, SvelteBlockType.element);
		expect(result).toBe('div');
	});
});

