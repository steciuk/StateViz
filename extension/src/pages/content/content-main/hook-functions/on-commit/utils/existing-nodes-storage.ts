import { Fiber } from '@pages/content/content-main/react-types';
import { NodeId } from '@src/shared/types/ParsedFiber';

export const EXISTING_NODES_DATA = new Map<
	NodeId,
	{ pathFromRoot: NodeId[]; parentId: NodeId | null; fiber: Fiber }
>();
