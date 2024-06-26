import 'construct-style-sheets-polyfill';

import config from '@root/tailwind.config';
import { cssom, observe, twind } from '@twind/core';

export function attachTwindStyle<T extends { adoptedStyleSheets: unknown }>(
	observedElement: Element,
	documentOrShadowRoot: T
) {
	const sheet = cssom(new CSSStyleSheet());
	const tw = twind(config, sheet);
	observe(tw, observedElement);
	documentOrShadowRoot.adoptedStyleSheets = [sheet.target];
}
