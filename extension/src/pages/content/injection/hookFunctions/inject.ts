import { emit } from '@pages/content/injection/hookFunctions/listeners';
import { RENDERERS } from '@pages/content/injection/hookStorage/hookStorage';
import { ReactRenderer } from '@pages/content/injection/reactTypes';

// TODO: consider allowing more renderers
const rendererId = 0;

/**
 * Run at the beginning, when React connects to the DevTools.
 * */
export function inject(renderer: ReactRenderer): number | null {
	console.log('inject', renderer);
	if (RENDERERS.size > 0) {
		// TODO: consider allowing more renderers
		console.warn('Only one renderer is supported');
		return rendererId;
	}

	RENDERERS.set(rendererId, renderer);

	// TODO: Possible console patching here

	// window.postMessage(
	// 	{
	// 		source: 'react-devtools-detector',
	// 		reactBuildType: 'development',
	// 	},
	// 	'*'
	// );

	emit('renderer', { id: rendererId, renderer, reactBuildType: 'development' });

	return rendererId;
}
