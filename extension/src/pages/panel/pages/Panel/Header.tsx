import classNames from 'classnames';
import React, { useState } from 'react';

import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FilterSettings } from '@pages/panel/pages/Panel/FilterSettings';

export const Header = () => {
	const [settingsOpened, setSettingsOpened] = useState<boolean>(false);

	return (
		<div className="p-2 border-b-2 border-secondary">
			<header className="flex justify-between items-center">
				<h1 className="font-semibold">State-Viz</h1>
				<FontAwesomeIcon
					icon={settingsOpened ? faXmark : faBars}
					className="text-xl text-primary cursor-pointer"
					onClick={() => setSettingsOpened(!settingsOpened)}
				/>
			</header>
			<div
				className={classNames('transition-all overflow-hidden', {
					'max-h-0': !settingsOpened,
					'max-h-[1000px]': settingsOpened,
				})}
			>
				<FilterSettings />
			</div>
		</div>
	);
};
