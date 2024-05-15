import { Info } from '@src/shared/components/Info';

export const NoLibrariesConnected = (props: { popup?: boolean }) => {
	return (
		<Info>
			<p>No adapter detected its library on the current page.</p>

			<p>
				If you suspect that at least one of the supported libraries is present
				on the page, try refreshing the page
				{props.popup ? '' : ' and/or closing and reopening the DevTools'}.
			</p>
		</Info>
	);
};

