import { runLog } from '@src/shared/run-log';
import { SvelteAdapter } from '@pages/content/content-main/svelte/SvelteAdapter';
import { ReactAdapter } from '@pages/content/content-main/react/ReactAdapter';

runLog('content-main.ts');

// Attach the content view to the page
// TODO: enabling this causes content script react renderer to try to
// hook to the extension. If deciding to use this, make changes to
// inject function.
// TODO: Uncomment the css line in manifest.ts when using this
// import('./components/Demo');

const svelteAdapter = new SvelteAdapter();
const reactAdapter = new ReactAdapter();

svelteAdapter.initialize();
reactAdapter.initialize();

