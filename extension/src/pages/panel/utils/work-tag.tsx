import { WorkTag } from '@src/shared/types/react-types';

export const workTagLabels = Object.keys(WorkTag).filter((key) =>
	isNaN(Number(key))
) as Array<keyof typeof WorkTag>;

export function getWorkTagLabel(tag: WorkTag) {
	return WorkTag[tag];
}
