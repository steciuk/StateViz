import { SvelteBlockType } from '@src/shared/types/svelte-types';

export type SvelteDevToolsHook = {
	v: Set<string>;
};

export interface SvelteEventMap {
	SvelteRegisterComponent: SvelteComponentDetail;
	SvelteRegisterBlock: SvelteBlockDetail;
	SvelteDOMInsert: {
		target: Node;
		node: Node;
		anchor?: Node;
	};
	SvelteDOMRemove: {
		node: Node;
	};
	SvelteDOMSetData: {
		data?: unknown;
		node: Node;
	};
	// not used yet
	SvelteDOMAddEventListener: unknown;
	SvelteDOMRemoveEventListener: unknown;
	SvelteDOMSetProperty: unknown;
	SvelteDOMSetAttribute: unknown;
	SvelteDOMRemoveAttribute: unknown;
}

// copied from svelte internal types
export type SvelteComponentFragment = {
	c(): void;
	d(detaching: boolean): void;
	h(): void;
	l(nodes: unknown[]): void;
	m(target: Node, anchor: Node): void;
	p(changed: boolean, ctx: unknown): void;
};

type SvelteComponentDetail = {
	id: string;
	// options: {
	// 	$$inline?: boolean;
	// 	hydrate?: boolean;
	// 	target?: Element;
	// 	props?: Record<string, unknown>;
	// };
	tagName: string;
	component: {
		$$: {
			fragment: SvelteComponentFragment;
			props: Record<string, unknown>;
		};
		// $$events_def?: {};
		// $$prop_def?: {};
		// $$slot_def?: {};
		$capture_state(): unknown;
	};
};

export type SvelteBlockDetail = {
	id: string;
	source: string;
	type: SvelteBlockType;

	detail?: unknown;
	tagName?: string;

	children: SvelteBlockDetail[];
	/** `type: 'element' | 'component'` */
	parent?: SvelteBlockDetail;
	/** like `parent` but `type: 'component'`  */
	container?: SvelteBlockDetail;

	block: SvelteComponentFragment;
	ctx: Array<unknown>;
};

