import React, { useState } from 'react';

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
			<div>
				<input
					type="radio"
					name="theme"
					value="light"
					checked={theme === 'light'}
					onChange={(e) => handleThemeChange(e.target.value as Theme)}
				/>
				Light
			</div>
			<div>
				<input
					type="radio"
					name="theme"
					value="dark"
					checked={theme === 'dark'}
					onChange={(e) => handleThemeChange(e.target.value as Theme)}
				/>
				Dark
			</div>
		</div>
	);
};
