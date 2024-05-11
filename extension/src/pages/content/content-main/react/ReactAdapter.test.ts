/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { ReactAdapter } from './ReactAdapter';

describe('ReactAdapter', () => {
	// TODO: test other methods

	const postMessageBridge = {
		send: vi.fn(),
		onMessage: vi.fn(),
	};
	let adapter: ReactAdapter;

	beforeEach(() => {
		adapter = new ReactAdapter(postMessageBridge as any);
		vi.clearAllMocks();
	});

	describe('inject', () => {
		it('should throw an error if React DevTools is already hooked', () => {
			window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
				stateViz: true,
			} as any;
			expect(() => adapter['inject']()).toThrowError(
				'State-Viz for React already hooked'
			);
		});

		it('should throw an error if React DevTools is already hooked', () => {
			window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {} as any;
			expect(() => adapter['inject']()).toThrowError(
				'React DevTools already hooked. Disable it to use State-Viz for React'
			);
		});

		it('should set the State-Viz hook', () => {
			window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
			adapter['inject']();
			expect(window.__REACT_DEVTOOLS_GLOBAL_HOOK__).toEqual({
				stateViz: true,
				renderers: expect.any(Object),
				supportsFiber: true,
				inject: expect.any(Function),
				checkDCE: expect.any(Function),
				onCommitFiberUnmount: expect.any(Function),
				onCommitFiberRoot: expect.any(Function),
			});
		});
	});

	describe('handleCommitFiberRoot', () => {
		it('should mount a new root if there is no alternate', () => {
			const root = { current: { alternate: null } };
			adapter['mountNewRoot'] = vi.fn();
			adapter['updateRoot'] = vi.fn();
			adapter['unmountFiber'] = vi.fn();
			adapter['handleCommitFiberRoot'](0, root as any);

			expect(adapter['mountNewRoot']).toHaveBeenCalledWith(root.current);
			expect(adapter['updateRoot']).not.toHaveBeenCalled();
			expect(adapter['unmountFiber']).not.toHaveBeenCalled();
		});

		it('should update an existing root if there is an alternate', () => {
			const root = {
				current: {
					alternate: { memoizedState: { element: 1, isDehydrated: false } },
					memoizedState: { element: 1, isDehydrated: false },
				},
			};
			adapter['mountNewRoot'] = vi.fn();
			adapter['updateRoot'] = vi.fn();
			adapter['unmountFiber'] = vi.fn();

			adapter['handleCommitFiberRoot'](0, root as any);

			expect(adapter['updateRoot']).toHaveBeenCalledWith(
				root.current,
				root.current.alternate
			);
			expect(adapter['mountNewRoot']).not.toHaveBeenCalled();
			expect(adapter['unmountFiber']).not.toHaveBeenCalled();
		});

		it('should unmount an existing root if it is not mounted anymore', () => {
			const root = {
				current: {
					alternate: { memoizedState: { element: 1, isDehydrated: false } },
				},
			};
			adapter['mountNewRoot'] = vi.fn();
			adapter['updateRoot'] = vi.fn();
			adapter['unmountFiber'] = vi.fn();

			adapter['handleCommitFiberRoot'](0, root as any);
			expect(adapter['unmountFiber']).toHaveBeenCalledWith(root.current);
			expect(adapter['updateRoot']).not.toHaveBeenCalled();
			expect(adapter['mountNewRoot']).not.toHaveBeenCalled();
		});
	});

	describe('mountNewRoot', () => {
		it('should mount a new root and send the mount roots message', () => {
			const root = {
				tag: 'div',
				child: { tag: 'span', sibling: null, child: null },
				alternate: null,
			};
			const expectedNode = {
				type: 'div',
				name: 'Unknown',
				children: [
					{
						type: 'span',
						name: 'Unknown',
						children: [],
						id: '1',
					},
				],
				id: '0',
			};
			adapter['refreshInspectedData'] = vi.fn();
			adapter['sendMountRoots'] = vi.fn();

			adapter['mountNewRoot'](root as any);
			expect(adapter['refreshInspectedData']).toHaveBeenCalledWith(root);
			expect(adapter['sendMountRoots']).toHaveBeenCalledWith([expectedNode]);
		});
	});

	describe('updateRoot', () => {
		it('should send the mount nodes message with the updated nodes', () => {
			const current = {
				tag: 'div',
				child: { tag: 'span', sibling: null, child: null },
				alternate: { tag: 'div', child: null, sibling: null },
			};
			const alternate = { tag: 'div', child: null, sibling: null };
			const expectedOperations = [
				{
					parentId: '0',
					anchor: { type: 'after', id: null },
					node: {
						type: 'span',
						name: 'Unknown',
						children: [],
						id: '1',
					},
				},
			];
			adapter['sendMountRoots'] = vi.fn(() => expectedOperations as any);
			adapter['sendMountNodes'] = vi.fn();
			adapter['updateRoot'](current as any, alternate as any);
			expect(adapter['sendMountNodes']).toHaveBeenCalledWith(
				expectedOperations
			);
		});
	});

	describe('unmountFiber', () => {
		it('should send the unmount nodes message and remove the fiber from existing nodes and inspected data', () => {
			const fiber = { tag: 'div' };
			adapter['sendUnmountNodes'] = vi.fn();
			adapter['existingNodes'].set('0', {
				parentId: null,
				fiber,
				node: null,
			} as any);
			adapter['inspectedData'].set('0', {} as any);
			adapter['unmountFiber'](fiber as any);
			expect(adapter['sendUnmountNodes']).toHaveBeenCalledWith({
				parentId: null,
				id: '0',
			});
			expect(adapter['existingNodes'].has('0')).toBe(false);
			expect(adapter['inspectedData'].has('0')).toBe(false);
		});
	});

	describe('getElementId', () => {
		it('should generate a new element ID if the fiber is not in the elementToId map', () => {
			const fiber = { tag: 'div' };
			adapter['generateNewElementId'] = vi.fn(() => '0');
			const id = adapter['getElementId'](fiber as any);
			expect(adapter['generateNewElementId']).toHaveBeenCalled();
			expect(id).toBe('0');
			expect(adapter['elementToId'].get(fiber)).toBe('0');
		});

		it('should return the existing element ID if the fiber is in the elementToId map', () => {
			const fiber = { tag: 'div' };
			adapter['elementToId'].set(fiber, '0');
			const id = adapter['getElementId'](fiber as any);
			expect(id).toBe('0');
		});

		it('should return the existing element ID of the alternate fiber if it exists', () => {
			const fiber = { tag: 'div', alternate: {} };
			adapter['elementToId'].set(fiber.alternate, '0');
			const id = adapter['getElementId'](fiber as any);
			expect(id).toBe('0');
			expect(adapter['elementToId'].get(fiber)).toBe('0');
		});
	});
});

