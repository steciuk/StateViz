/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';

import { getParsedNodeDisplayName } from './getParsedNodeDisplayName';
import { SvelteBlockType } from '@src/shared/types/svelte-types';

describe('getParsedNodeDisplayName', () => {
	it('should return "#anchor" for anchor type', () => {
		const node = {
			type: SvelteBlockType.anchor,
			name: 'someName',
		};

		const result = getParsedNodeDisplayName(node);

		expect(result).toBe('#anchor');
	});

	it('should return "<elementName>" for element type', () => {
		const node = {
			type: SvelteBlockType.element,
			name: 'div',
		};

		const result = getParsedNodeDisplayName(node);

		expect(result).toBe('<div>');
	});

	it('should return ""nodeName"" for text type', () => {
		const node = {
			type: SvelteBlockType.text,
			name: 'Some text',
		};

		const result = getParsedNodeDisplayName(node);

		expect(result).toBe('"Some text"');
	});

	it('should return "{#nodeName}" for each, if, else, then, catch, pending, key, and slot types', () => {
		const nodeTypes = [
			SvelteBlockType.each,
			SvelteBlockType.if,
			SvelteBlockType.else,
			SvelteBlockType.then,
			SvelteBlockType.catch,
			SvelteBlockType.pending,
			SvelteBlockType.key,
			SvelteBlockType.slot,
		];

		nodeTypes.forEach((nodeType) => {
			const node = {
				type: nodeType,
				name: 'someName',
			};

			const result = getParsedNodeDisplayName(node);

			expect(result).toBe(`{#${node.name}}`);
		});
	});

	it('should return the node name for other types', () => {
		const node = {
			type: 'someType',
			name: 'someName',
		};

		const result = getParsedNodeDisplayName(node as any);

		expect(result).toBe('someName');
	});
});

