import { parseRoot } from '@pages/content/content-main/fiber-parser/parse-fiber';
import { FiberRoot, RendererID } from '@pages/content/content-main/react-types';
import {
	PostMessageBridge,
	PostMessageSource,
	PostMessageType,
} from '@pages/content/shared/PostMessageBridge';

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

export function onCommitFiberRoot(
	rendererID: RendererID,
	root: FiberRoot,
	priorityLevel?: number,
	didError?: boolean
): void {
	// console.log(root);
	const parsedFiber = parseRoot(root);
	postMessageBridge.send({
		type: PostMessageType.COMMIT_ROOT,
		content: parsedFiber,
	});
}
