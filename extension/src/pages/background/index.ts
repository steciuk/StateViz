import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';

/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
import { runLog } from '@src/shared/run-log';

reloadOnUpdate('pages/background');
reloadOnUpdate('pages/content/style.scss');
// ------------------------------

runLog('background.ts');

chrome.runtime.onConnect.addListener((port) => {
	console.log('background - onConnect');
	port.onMessage.addListener((msg) => {
		console.log('background - onMessage');
		console.log(msg);
	});
});
