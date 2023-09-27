import { ListenersStorage } from '@pages/content/injection/hookStorage/ListenersStorage';
import { ReactRenderer, RendererID } from '@pages/content/injection/reactTypes';

export const RENDERERS: Map<RendererID, ReactRenderer> = new Map();
export const LISTENERS = new ListenersStorage();
