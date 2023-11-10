import { parseRoot } from '@pages/content/content-main/fiber-parser/parse-fiber';
import { FiberRoot, RendererID } from '@pages/content/content-main/react-types';

export function onCommitFiberRoot(
	rendererID: RendererID,
	root: FiberRoot,
	priorityLevel?: number,
	didError?: boolean
): void {
	console.log(root);
	const parsedFiber = parseRoot(root);
	console.log(parsedFiber);
}
