export type SvelteDevToolsHook = {
	v: Set<string>;
};

export interface SvelteEventMap {
	SvelteRegisterComponent: {
		component: SvelteComponentDetail;
	};
	SvelteRegisterBlock: {
		detail: unknown;
	};
	SvelteDOMInsert: {
		target: Node;
		node: Node;
		anchor?: Node;
	};
	SvelteDOMRemove: {
		detail: unknown;
	};
	SvelteDOMAddEventListener: {
		detail: unknown;
	};
	SvelteDOMRemoveEventListener: {
		detail: unknown;
	};
	SvelteDOMSetData: {
		detail: unknown;
	};
	SvelteDOMSetProperty: {
		detail: unknown;
	};
	SvelteDOMSetAttribute: {
		detail: unknown;
	};
	SvelteDOMRemoveAttribute: {
		detail: unknown;
	};
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
	options: {
		$$inline?: boolean;
		hydrate?: boolean;
		target?: Element;
		props?: Record<string, unknown>;
	};
	tagName: string;
	component: {
		$$: {
			fragment: SvelteComponentFragment;
		};
		// $$events_def?: {};
		// $$prop_def?: {};
		// $$slot_def?: {};
		$capture_state(): unknown;
	};
};

export enum SvelteBlockType {
	anchor = 'anchor',
	block = 'block',
	catch = 'catch',
	component = 'component',
	each = 'each',
	element = 'element',
	else = 'else',
	if = 'if',
	iteration = 'iteration',
	key = 'key',
	pending = 'pending',
	slot = 'slot',
	text = 'text',
	then = 'then',
}

type SvelteBlockDetail = {
	id: number;
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
	ctx: Array<unknown>; // TODO: do we need this typed?
};

