import { RENDERERS } from '@pages/content/content-main/react/hook-functions/utils/hook-storage';
import { ReactRenderer } from '@pages/content/content-main/react/react-types';
import {
  PostMessageBridge,
  PostMessageSource,
  PostMessageType
} from '@pages/content/shared/PostMessageBridge';

// TODO: consider allowing more renderers
const rendererId = 0;

const postMessageBridge = PostMessageBridge.getInstance(PostMessageSource.MAIN);

/**
 * Run at the beginning, when React connects to the DevTools.
 * */
export function inject(renderer: ReactRenderer): number | null {
  console.log('inject', renderer);
  if (RENDERERS.size > 0) {
    // TODO: consider allowing more renderers
    console.warn('Only one renderer is supported');
    return null;
  }

  postMessageBridge.send({
    type: PostMessageType.REACT_ATTACHED,
  });

  RENDERERS.set(rendererId, renderer);

  // TODO: Possible console patching here

  // Why is this needed? (see: extension/src/pages/content/index.ts)
  // window.postMessage(
  // 	{
  // 		source: 'react-devtools-detector',
  // 		reactBuildType: 'development',
  // 	},
  // 	'*'
  // );
  // emit('renderer', {
  //   id: rendererId,
  //   renderer,
  //   reactBuildType: 'development'
  // });

  return rendererId;
}
