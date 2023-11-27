import { WorkTag } from '@src/shared/types/react-types';

export type NodeId = number;

export type ParsedFiber = {
	tag: WorkTag;
	name: string;
	children: ParsedFiber[];
	id: NodeId;
};
