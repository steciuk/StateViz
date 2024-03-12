import { runLog } from '@src/shared/run-log';
import { SvelteAdapter } from '@pages/content/content-main/svelte/SvelteAdapter';
import {
	PostMessageBridge,
	PostMessageSource,
} from '@pages/content/shared/PostMessageBridge';
import { ReactAdapter } from '@pages/content/content-main/react/ReactAdapter';

runLog('content-main.ts');

// Attach the content view to the page
// TODO: enabling this causes content script react renderer to try to
// hook to the extension. If deciding to use this, make changes to
// inject function.
// TODO: Uncomment the css line in manifest.ts when using this
// import('./components/Demo');

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

const svelteAdapter = new SvelteAdapter(postMessageBridge);
const reactAdapter = new ReactAdapter(postMessageBridge);

svelteAdapter.initialize();
reactAdapter.initialize();

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

