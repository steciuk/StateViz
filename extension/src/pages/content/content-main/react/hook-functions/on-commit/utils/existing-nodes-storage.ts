import { Fiber } from '@pages/content/content-main/react/react-types';
import { NodeId } from '@src/shared/types/ParsedFiber';

export const EXISTING_FIBERS_DATA = new Map<
	NodeId,
	{ parentId: NodeId | null; fiber: Fiber }
>();

