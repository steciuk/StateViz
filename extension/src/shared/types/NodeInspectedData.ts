import { InspectData } from '@src/shared/types/DataType';
import { Library } from '@src/shared/types/Library';
import { NodeId } from '@src/shared/types/ParsedNode';

export type NodeInspectedData = {
	library: Library;
	id: NodeId;
	name: string;
	nodeInfo: Array<{ label: string; value: string }>;
	nodeData: NodeDataGroup[];
};

export type NodeDataGroup = {
	group: string;
	data: Array<{ label: string; value: InspectData }>;
};
