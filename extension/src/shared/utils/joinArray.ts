export function joinArray(array: string[]): string {
	if (array.length === 0) {
		return '';
	}

	if (array.length === 1) {
		return array[0];
	}

	return array.slice(0, -1).join(', ') + ' and ' + array.slice(-1);
}

