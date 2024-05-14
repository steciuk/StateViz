export function getRendererMajorVersion(version?: unknown): number | null {
	if (typeof version === 'number') {
		return version;
	}
	if (typeof version === 'string') {
		const major = parseInt(version.split('.')[0], 10);
		if (isNaN(major)) {
			return null;
		}
		return major;
	}
	return null;
}

