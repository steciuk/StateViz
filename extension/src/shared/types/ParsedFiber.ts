import { WorkTag } from '@src/shared/types/react-types';

export type NodeId = number;

// TODO: Change name, cause not only used for React anymore
export type ParsedFiber = {
	tag: WorkTag;
	name: string;
	children: ParsedFiber[];
	id: NodeId;
};

