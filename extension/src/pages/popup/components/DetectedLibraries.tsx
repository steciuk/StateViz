import { Info } from '@src/shared/components/Info';
import { Library } from '@src/shared/types/Library';
import { joinArray } from '@src/shared/utils/joinArray';
import React from 'react';

export const DetectedLibraries = (props: { libraries: Library[] }) => {
	return (
		<Info>
			<p>Successfully detected {joinArray(props.libraries)}.</p>

			<p>
				Open the DevTools (State-Viz tab) to inspect the state of your
				application.
			</p>
		</Info>
	);
};

