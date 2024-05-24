import { Info } from '@src/shared/components/Info';

// TODO: Refactor. Passing a panel prop like this isn't the best practice.
export const NoLibrariesConnected = (props: { panel?: boolean }) => {
	return (
		<Info>
			<p>No adapter detected its library on the current page.</p>

			<p>
				If you suspect that at least one of the supported libraries is present
				on the page, try refreshing the page
				{props.panel
					? ', clicking the button below and/or closing and reopening the DevTools'
					: ''}
				.
			</p>
			{props.panel && (
				<button
					onClick={() => window.location.reload()}
					className="hover:bg-secondary-hover rounded bg-secondary px-4 py-2 font-bold transition-all"
				>
					Reload the panel
				</button>
			)}
		</Info>
	);
};

