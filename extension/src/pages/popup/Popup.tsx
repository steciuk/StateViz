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

	return (
		<div className="min-w-[20rem] bg-background p-4 text-text">
			<h1 className="mb-4 text-center text-xl">State-Viz</h1>
			{librariesAttached.length === 0 ? (
				<NoLibrariesConnected />
			) : (
				<div className="grid h-full w-full place-items-center">
					<div className="flex max-w-sm flex-col items-center gap-2 text-center">
						<div>
							<p>Successfully detected libraries on the page:</p>
							<ul>
								{librariesAttached.map((library) => (
									<li key={library}>- {library}</li>
								))}
							</ul>
						</div>

						<p>
							Open the DevTools (State-Viz tab) to inspect the state of your
							application.
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default withErrorBoundary(
	withSuspense(Popup, <div> Loading ... </div>),
	<div> Error Occur </div>
);

