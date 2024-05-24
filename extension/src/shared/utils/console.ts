/* eslint-disable no-console */
// Globally disabling console functions
// or using vite-plugin-remove-console
// leads to problems with production builds

const isDisabled = {
	consoleLog: IS_PROD,
	consoleError: false,
	consoleWarn: false,
};

export function consoleLog(...message: unknown[]) {
	if (isDisabled.consoleLog) return;
	console.log(...message);
}

export function consoleError(...message: unknown[]) {
	if (isDisabled.consoleError) return;
	console.error(...message);
}

export function consoleWarn(...message: unknown[]) {
	if (isDisabled.consoleWarn) return;
	console.warn(...message);
}

