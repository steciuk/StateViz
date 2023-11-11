import { ParsedFiber } from '@src/shared/types/ParsedFiber';
import { OmitFromUnion } from '@src/shared/utility-types';

export enum PostMessageSource {
	ISOLATED = 'ISOLATED',
	MAIN = 'MAIN',
}

export enum PostMessageType {
	REACT_ATTACHED = 'REACT_ATTACHED',
	COMMIT_ROOT = 'COMMIT_ROOT',
}

type ReactAttachedPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.REACT_ATTACHED;
	content?: undefined;
};

type CommitRootPostMessage = {
	source: PostMessageSource.MAIN;
	type: PostMessageType.COMMIT_ROOT;
	content: ParsedFiber;
};

type PostMessage = ReactAttachedPostMessage | CommitRootPostMessage;

export class PostMessageBridge {
	private constructor(private source: PostMessageSource) {}
	private static instance: PostMessageBridge | undefined;

	static getInstance(source: PostMessageSource) {
		if (!PostMessageBridge.instance) {
			PostMessageBridge.instance = new PostMessageBridge(source);
		}

		if (PostMessageBridge.instance.source !== source) {
			throw new Error(
				'PostMessageBridge already initialized with different source'
			);
		}

		return PostMessageBridge.instance;
	}

	send(message: OmitFromUnion<PostMessage, 'source'>) {
		window.postMessage(
			{
				source: this.source,
				...message,
			},
			window.origin
		);
	}

	onMessage(callback: (message: PostMessage) => void): () => void {
		const eventListener = (event: MessageEvent<PostMessage>) => {
			if (event.origin !== window.origin) return;
			if (event.data.source === this.source) return;

			callback(event.data);
		};

		window.addEventListener('message', eventListener);

		return () => {
			window.removeEventListener('message', eventListener);
		};
	}

	onMessageOnce(callback: (message: PostMessage) => void) {
		window.addEventListener(
			'message',
			(event: MessageEvent<PostMessage>) => {
				if (event.origin !== window.origin) return;
				if (event.data.source !== this.source) return;

				callback(event.data);
			},
			{ once: true }
		);
	}
}
