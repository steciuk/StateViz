import { WorkTag } from '@src/shared/types/react-types';

export function getWorkTagLabel(tag: WorkTag): string {
	return WorkTag[tag] ?? 'Unknown';
}

