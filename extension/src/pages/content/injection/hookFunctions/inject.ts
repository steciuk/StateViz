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
		return null;
	}

	RENDERERS.set(rendererId, renderer);

	// TODO: Possible console patching here

	// Why is this needed? (see: extension/src/pages/content/index.ts)
	// emit('renderer', { id: rendererId, renderer, reactBuildType: 'development' });

	return rendererId;
}
