import { EXISTING_NODES_DATA } from '@pages/content/content-main/react/hook-functions/on-commit/utils/existing-nodes-storage';
import { getFiberName } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getFiberName';
import { getOrGenerateNodeId } from '@pages/content/content-main/react/hook-functions/on-commit/utils/getOrGenerateNodeId';
import { getParseChildren } from '@pages/content/content-main/react/hook-functions/on-commit/utils/parseChildren';
import { sendMountOperations } from '@pages/content/content-main/react/hook-functions/on-commit/utils/send-operations';
import { handleNodeInspect } from '@pages/content/content-main/react/inspect-element/inspect-element';
import { Fiber } from '@pages/content/content-main/react/react-types';
import { ParsedFiber } from '@src/shared/types/ParsedFiber';

export function mountNewRoot(root: Fiber): void {
  const rootId = getOrGenerateNodeId(root);

  handleNodeInspect(root);
  EXISTING_NODES_DATA.set(rootId, {
    pathFromRoot: [rootId],
    parentId: null,
    fiber: root,
  });

  const node: ParsedFiber = {
    tag: root.tag,
    name: getFiberName(root),
    children: getParseChildren(root, [rootId]),
    id: rootId,
  };

  sendMountOperations([
    {
      pathFromRoot: [],
      afterNode: null,
      node: node,
    },
  ]);
}
