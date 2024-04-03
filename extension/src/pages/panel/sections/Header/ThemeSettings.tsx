import React, { useEffect } from 'react';

import { Toggle } from '@pages/panel/components/Toggle';
import useStorage from '@src/shared/hooks/useStorage';
import themeStorage from '@src/shared/storages/ThemeStorage';

type Theme = 'light' | 'dark';

export const ThemeSettings = () => {
	const theme = useStorage(themeStorage);

	const handleThemeChange = (value: Theme) => {
		themeStorage.set(value);
	};

	useEffect(() => {
		if (theme === 'light') {
			document.body.classList.remove('dark');
		} else if (theme === 'dark') {
			document.body.classList.add('dark');
		}
	}, [theme]);

	return (
		<div>
			<h2 className="text-lg">Theme</h2>
			<Toggle
				value={theme === 'light'}
				onChange={(value) => handleThemeChange(value ? 'light' : 'dark')}
				label="Light"
				type="radio"
			/>
			<Toggle
				value={theme === 'dark'}
				onChange={(value) => handleThemeChange(value ? 'dark' : 'light')}
				label="Dark"
				type="radio"
			/>
		</div>
	);
};

