import { injectHook } from '@pages/content/content-main/inject-hook';
import { runLog } from '@src/shared/run-log';
import { SvelteAdapter } from '@pages/content/content-main/svelte/SvelteAdapter';
import {
	PostMessageBridge,
	PostMessageSource,
} from '@pages/content/shared/PostMessageBridge';

runLog('content-main.ts');

// Attach the content view to the page
// TODO: enabling this causes content script react renderer to try to
// hook to the extension. If deciding to use this, make changes to
// inject function.
// TODO: Uncomment the css line in manifest.ts when using this
// import('./components/Demo');

injectHook();
const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);
const svelteAdapter = new SvelteAdapter(postMessageBridge);
svelteAdapter.initialize();

// TODO: why is this needed? (see: extension/src/pages/content/injection/hookFunctions/inject.ts)
// on('renderer', ({ reactBuildType }) => {
// 	console.log('on - renderer', reactBuildType);
// 	window.postMessage(
// 		{
// 			source: 'react-devtools-detector',
// 			reactBuildType,
// 		},
// 		'*'
// 	);
// });

