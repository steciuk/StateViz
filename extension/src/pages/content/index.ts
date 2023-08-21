import { injectHook } from '@pages/content/injection/injectHook';

// Attach the content view to the page
import('./components/Demo');

console.log(__BUILD_TIME__);

// Inject the hook
injectHook();
