import React, { useEffect, useState } from 'react';

import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';
import withSuspense from '@src/shared/hoc/withSuspense';
import useStorage from '@src/shared/hooks/useStorage';
import themeStorage from '@src/shared/storages/ThemeStorage';
import { Library } from '@src/shared/types/Library';
import {
	ChromeMessageSource,
	ChromeMessageType,
	sendChromeMessageToTab,
} from '@src/shared/chrome/chrome-message';
import { Footer } from '@pages/popup/components/Footer';
import { Content } from '@pages/popup/components/Content';
import { Header } from '@pages/popup/components/Header';

const Popup = () => {
	const theme = useStorage(themeStorage);

	const [librariesAttached, setLibrariesAttached] = useState<
		Library[] | undefined
	>([]);

	useEffect(() => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			sendChromeMessageToTab(tabs[0].id!, {
				type: ChromeMessageType.WHAT_LIBRARIES_ATTACHED,
				source: ChromeMessageSource.POPUP,
				responseCallback: (libraries: Library[]) => {
					setLibrariesAttached(libraries);
				},
			});
		});
	}, []);

	useEffect(() => {
		if (theme === 'light') {
			document.body.classList.remove('dark');
		} else if (theme === 'dark') {
			document.body.classList.add('dark');
		}
	}, [theme]);

	return (
		<div className="flex min-w-[20rem] flex-col gap-4 bg-background p-2 text-text">
			<Header libraries={librariesAttached} />
			<Content libraries={librariesAttached} />
			<Footer />
		</div>
	);
};

export default withErrorBoundary(
	withSuspense(Popup, <div> Loading ... </div>),
	<div> Error Occur </div>
);

