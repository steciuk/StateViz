import { ListenersStorage } from '@pages/content/injection/hook-storage/ListenersStorage';
import { ReactRenderer, RendererID } from '@pages/content/injection/react-types';

export const RENDERERS: Map<RendererID, ReactRenderer> = new Map();
export const LISTENERS = new ListenersStorage();
export const RENDERER_INTERFACES = new Map();
