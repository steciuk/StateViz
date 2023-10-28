import { RENDERERS } from '@pages/content/injection/hook-storage/hook-storage';
import { ReactRenderer } from '@pages/content/injection/react-types';
import { PostMessageBridge, PostMessageSource } from '@pages/content/shared/post-message';

// TODO: consider allowing more renderers
const rendererId = 0;

/**
 * Run at the beginning, when React connects to the DevTools.
 * */
export function inject(renderer: ReactRenderer): number | null {
	// console.log('inject', renderer);
	if (RENDERERS.size > 0) {
		// TODO: consider allowing more renderers
		console.warn('Only one renderer is supported');
		return null;
	}

	const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);
	postMessageBridge.send('REACT_ATTACHED');

	RENDERERS.set(rendererId, renderer);

	// TODO: Possible console patching here

	// Why is this needed? (see: extension/src/pages/content/index.ts)
	// window.postMessage(
	// 	{
	// 		source: 'react-devtools-detector',
	// 		reactBuildType: 'development',
	// 	},
	// 	'*'
	// );
	// emit('renderer', {
	//   id: rendererId,
	//   renderer,
	//   reactBuildType: 'development'
	// });

	return rendererId;
}
