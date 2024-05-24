import React from 'react';
import enabled from '@src/assets/icons/enabled-128.png';
import disabled from '@src/assets/icons/disabled-128.png';
import { Library } from '@src/shared/types/Library';

export const Header = (props: { libraries: Library[] | undefined }) => {
	const icon =
		props.libraries && props.libraries.length >= 0 ? enabled : disabled;

	return (
		<header>
			<img src={icon} alt="StateViz" className="mx-auto h-20 w-20" />
			<h1 className="text-center text-xl">StateViz</h1>
		</header>
	);
};

