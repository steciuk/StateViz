import { describe, expect, it } from 'vitest';
import { getRendererMajorVersion } from './getRendererMajorVersion';

describe('getRendererMajorVersion', () => {
	it('should return the version when it is a number', () => {
		const version = 3;
		const result = getRendererMajorVersion(version);
		expect(result).toBe(version);
	});

	it('should return the major version when it is a string', () => {
		const version = '1.2.3';
		const result = getRendererMajorVersion(version);
		expect(result).toBe(1);
	});

	it('should return null when the version is not a number or string', () => {
		const version = { major: 1 };
		const result = getRendererMajorVersion(version);
		expect(result).toBeNull();
	});

	it('should return null when the major version cannot be parsed from the string', () => {
		const version = 'invalid';
		const result = getRendererMajorVersion(version);
		expect(result).toBeNull();
	});
});

