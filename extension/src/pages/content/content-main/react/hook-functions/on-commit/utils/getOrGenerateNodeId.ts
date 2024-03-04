import { Fiber } from '@pages/content/content-main/react/react-types';
import { NodeId } from '@src/shared/types/ParsedFiber';

let nodeIdCounter = 0;

const NODE_TO_ID_MAP = new Map<Fiber, NodeId>();

export function getOrGenerateNodeId(fiber: Fiber): NodeId {
  const alternate = fiber.alternate;
  const fiberId = NODE_TO_ID_MAP.get(fiber);

  if (fiberId !== undefined) {
    if (alternate && !NODE_TO_ID_MAP.has(alternate)) {
      NODE_TO_ID_MAP.set(alternate, fiberId);
    }

    return fiberId;
  }

  if (alternate) {
    const alternateId = NODE_TO_ID_MAP.get(alternate);

    if (alternateId) {
      NODE_TO_ID_MAP.set(fiber, alternateId);
      return alternateId;
    }
  }

  const id = nodeIdCounter++;
  NODE_TO_ID_MAP.set(fiber, id);

  if (alternate) {
    NODE_TO_ID_MAP.set(alternate, id);
  }

  return id;
}
