import { ContentIsolated } from '@pages/content/content-isolated/ContentIsolated';
import { runLog } from '@src/shared/run-log';
import { injectForSvelte } from '../content-main/svelte/injectForSvelte';

runLog('content-isolated.ts');

ContentIsolated.initialize();

