import React, { useState } from 'react';

import { Toggle } from '@pages/panel/components/Toggle';

type Theme = 'light' | 'dark';

export const ThemeSettings = () => {
	const [theme, setTheme] = useState<Theme>('light');

	const handleThemeChange = (value: Theme) => {
		setTheme(value);
		if (value === 'light') {
			document.body.classList.remove('dark');
		} else if (value === 'dark') {
			document.body.classList.add('dark');
		}
	};

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
