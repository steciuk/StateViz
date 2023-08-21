/**
 * Extension reloading is necessary because the browser automatically caches the css.
 * If you do not use the css of the content script, please delete it.
 */
import reloadOnUpdate from 'virtual:reload-on-update-in-background-script';

reloadOnUpdate('pages/background');
reloadOnUpdate('pages/content/style.scss');
// ------------------------------

console.log('background loaded');

chrome.runtime.onConnect.addListener((port) => {
	console.log('background - onConnect');
	port.onMessage.addListener((msg) => {
		console.log('background - onMessage');
		console.log(msg);
	});
});
