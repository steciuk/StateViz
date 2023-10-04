import { runLog } from '@src/shared/run-log';

runLog('devtools.ts');

try {
	chrome.devtools.panels.create('Dev Tools', 'icon-34.png', 'src/pages/panel/index.html');
} catch (e) {
	console.error(e);
}
