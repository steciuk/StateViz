import { describe, it, expect } from 'vitest';
import { joinArray } from './joinArray';

describe('joinArray', () => {
	it('should return an empty string for an empty array', () => {
		const result = joinArray([]);
		expect(result).toBe('');
	});

	it('should return the single element for an array with one element', () => {
		const result = joinArray(['apple']);
		expect(result).toBe('apple');
	});

	it('should join the elements with commas and "and" for an array with multiple elements', () => {
		const result = joinArray(['apple', 'banana', 'orange']);
		expect(result).toBe('apple, banana and orange');
	});
});

