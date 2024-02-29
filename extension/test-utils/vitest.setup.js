// Temporal fix directly in vitest-chrome package.json
// see: https://github.com/probil/vitest-chrome/pull/1
import * as chrome from 'vitest-chrome';

Object.assign(global, chrome);
