/** @type {import("prettier").Config} */
const config = {
	singleQuote: true,
	trailingComma: 'es5',
	printWidth: 80,
	tabWidth: 2,
	semi: true,
	bracketSpacing: true,
	useTabs: true,
	arrowParens: 'always',
	plugins: ['prettier-plugin-tailwindcss'],
	endOfLine: 'crlf',
};

export default config;
