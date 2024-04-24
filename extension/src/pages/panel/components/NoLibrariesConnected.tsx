import { Library } from '@src/shared/types/Library';
import React from 'react';

export const NoLibrariesConnected = () => {
	return (
		<div className="grid h-full w-full place-items-center">
			<div className="flex max-w-sm flex-col items-center gap-2 text-center">
				<h2 className="p-4 text-lg">No libraries connected</h2>
				<p>No adapter detected its library on the current page.</p>

				<div>
					<p>Registered adapters:</p>
					<ul>
						{Object.values(Library).map((library) => (
							<li key={library}>- {library}</li>
						))}
					</ul>
				</div>

				<p>
					If you suspect that at least one of the listed libraries is present on
					the page, try refreshing the page and/or closing and reopening the
					DevTools.
				</p>
			</div>
		</div>
	);
};

