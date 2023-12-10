import classNames from 'classnames';
import React, { useState } from 'react';

import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FilterSettings } from '@pages/panel/pages/Panel/Header/FilterSettings';
import { ThemeSettings } from '@pages/panel/pages/Panel/Header/ThemeSettings';

export const Header = () => {
	const [settingsOpened, setSettingsOpened] = useState<boolean>(false);

	return (
		<div className="border-b-2 border-secondary p-2">
			<header className="flex items-center justify-between">
				<h1 className="text-xl font-semibold">State-Viz</h1>
				<FontAwesomeIcon
					icon={settingsOpened ? faXmark : faBars}
					className="cursor-pointer text-xl text-primary"
					onClick={() => setSettingsOpened(!settingsOpened)}
				/>
			</header>
			<div
				className={classNames('grid overflow-hidden transition-all', {
					'max-h-0': !settingsOpened,
					'max-h-[1000px]': settingsOpened,
				})}
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
				}}
			>
				{/* {TODO: persist the settings} */}
				<FilterSettings />
				<ThemeSettings />
			</div>
		</div>
	);
};