import { runLog } from '@src/shared/run-log';

runLog('content-isolated.ts');

// setTimeout(() => {
// 	// chrome.runtime.sendMessage({
// 	// 	source: ChromeMessageSource.CONTENT_SCRIPT,
// 	// 	type: ChromeMessageType.REACT_ATTACHED,
// 	// });
// 	sendChromeMessage({
// 		source: ChromeMessageSource.CONTENT_SCRIPT,
// 		type: ChromeMessageType.REACT_ATTACHED,
// 	});
// 	console.log('content-isolated.ts - setTimeout');
// }, 1000);
