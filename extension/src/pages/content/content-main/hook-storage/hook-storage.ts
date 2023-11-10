import { ListenersStorage } from '@pages/content/content-main/hook-storage/ListenersStorage';
import {
	ReactRenderer,
	RendererID,
} from '@pages/content/content-main/react-types';

export const RENDERERS: Map<RendererID, ReactRenderer> = new Map();
export const LISTENERS = new ListenersStorage();

// Not yet used
export const RENDERER_INTERFACES = new Map();
export const FIBER_ROOTS = new Map<RendererID, Set<any>>();
