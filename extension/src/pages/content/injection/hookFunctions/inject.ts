import { ReactRenderer } from '@pages/content/injection/reactTypes';

// TODO: consider allowing more renderers
const rendererID = 0;
let reactRenderer: ReactRenderer | undefined = undefined;

/**
 * Run at the beginning, when React connects to the DevTools.
 * */
export function inject(renderer: ReactRenderer) {
	if (reactRenderer) {
		// TODO: consider allowing more renderers
		console.warn('Only one renderer is supported');
		return null;
	}

	reactRenderer = renderer;

	// TODO: Possible console patching here

	return rendererID;
}
