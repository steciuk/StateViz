/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, expect, it } from 'vitest';
import { getNearestStateNode } from './getNearestStateNode';

describe('getNearestStateNode', () => {
	it('should return stateNode if is already an instance of Node', () => {
		const stateNode = document.createElement('div');

		const fiber = {
			stateNode,
			child: null,
		};
		const result = getNearestStateNode(fiber as any);
		expect(result).toBe(stateNode);
	});

	it('should return null if no stateNode is found in the fiber tree', () => {
		const fiber = {
			stateNode: null,
			child: null,
		};
		const result = getNearestStateNode(fiber as any);
		expect(result).toBe(null);
	});

	it('should return the nearest stateNode in the fiber tree', () => {
		const childStateNode = document.createElement('span');
		const fiber = {
			stateNode: null,
			child: {
				stateNode: childStateNode,
				child: null,
			},
		};

		const result = getNearestStateNode(fiber as any);
		expect(result).toBe(childStateNode);
	});
});

