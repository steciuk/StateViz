import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';

import { runLog } from '@src/shared/run-log';

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
reloadOnUpdate('pages/background');
reloadOnUpdate('pages/content/style.scss');
// ------------------------------

runLog('background.ts');
