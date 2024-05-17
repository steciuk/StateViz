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
import { NoLibrariesConnected } from '@src/shared/components/NoLibrariesConnected';
import { DetectedLibraries } from '@pages/popup/components/DetectedLibraries';
import { Footer } from '@pages/popup/components/Footer';
import enabled from '@src/assets/icons/enabled-128.png';
import disabled from '@src/assets/icons/disabled-128.png';

const Popup = () => {
	const theme = useStorage(themeStorage);

	const [librariesAttached, setLibrariesAttached] = useState<Library[]>([]);

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

	const icon = librariesAttached.length === 0 ? disabled : enabled;

	return (
		<div className="flex min-w-[20rem] flex-col gap-4 bg-background p-2 text-text">
			<div>
				<img src={icon} alt="StateViz" className="mx-auto h-20 w-20" />
				<h1 className="text-center text-xl">StateViz</h1>
			</div>

			<main>
				{librariesAttached.length === 0 ? (
					<NoLibrariesConnected popup={true} />
				) : (
					<DetectedLibraries libraries={librariesAttached} />
				)}
			</main>
			<Footer />
		</div>
	);
};

export default withErrorBoundary(
	withSuspense(Popup, <div> Loading ... </div>),
	<div> Error Occur </div>
);

