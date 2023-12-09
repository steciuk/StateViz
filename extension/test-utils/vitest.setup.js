// for some reason vitest is using CommonJS, so we need to import it like this
import * as chrome from 'vitest-chrome/lib/index.esm.js';

Object.assign(global, chrome);
