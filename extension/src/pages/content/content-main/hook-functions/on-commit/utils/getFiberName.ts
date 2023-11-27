import { Fiber } from '@pages/content/content-main/react-types';

export function getFiberName(fiber: Fiber): string {
	const type = fiber.type;

	switch (typeof type) {
		case 'string':
			return type;

		case 'function':
			return type.name;

		case 'symbol':
			return type.toString();

		default:
			return 'Unknown';
	}
}
