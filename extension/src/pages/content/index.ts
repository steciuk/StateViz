import { on } from '@pages/content/injection/hookFunctions/listeners';
import { injectHook } from '@pages/content/injection/injectHook';

// Attach the content view to the page
// TODO: enabling this causes content script react renderer to try to
// hook to the extension. If deciding to use this, make changes to
// inject function.
// import('./components/Demo');

console.log(__BUILD_TIME__);
injectHook();

// TODO: why is this needed?
on('renderer', ({ reactBuildType }) => {
	console.log('on - renderer', reactBuildType);
	window.postMessage(
		{
			source: 'react-devtools-detector',
			reactBuildType,
		},
		'*'
	);
});
