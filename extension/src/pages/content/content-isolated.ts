import { sendChromeMessage } from '@pages/content/utils/chrome-message';
import { ChromeMessageSource, ChromeMessageType } from '@src/shared/chrome-message/events';

setTimeout(() => {
	// chrome.runtime.sendMessage({
	// 	source: ChromeMessageSource.CONTENT_SCRIPT,
	// 	type: ChromeMessageType.REACT_ATTACHED,
	// });
	sendChromeMessage({
		source: ChromeMessageSource.CONTENT_SCRIPT,
		type: ChromeMessageType.REACT_ATTACHED,
	});
	console.log('content-isolated.ts - setTimeout');
}, 1000);

console.log('content-isolated.ts');
