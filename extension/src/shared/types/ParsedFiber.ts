import { WorkTag } from '@src/shared/types/react-types';

export type ParsedFiber = {
	tag: WorkTag;
	name: string;
	children: ParsedFiber[];
	id: number;
};
