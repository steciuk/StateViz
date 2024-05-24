import { DetectedLibraries } from '@pages/popup/components/DetectedLibraries';
import { NoLibrariesConnected } from '@src/shared/components/NoLibrariesConnected';
import { Library } from '@src/shared/types/Library';

export const Content = (props: { libraries: Library[] | undefined }) => {
	const librariesAttached = props.libraries;

	return (
		<main>
			{librariesAttached && librariesAttached.length >= 0 ? (
				<DetectedLibraries libraries={librariesAttached} />
			) : (
				<NoLibrariesConnected popup={true} />
			)}
		</main>
	);
};

