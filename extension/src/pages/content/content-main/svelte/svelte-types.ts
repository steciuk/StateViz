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
		detail: unknown;
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

export type SvelteNodeDetail = SvelteComponentDetail;

// copied from svelte internal types
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
			fragment: {
				c(): void;
				d(detaching: boolean): void;
				h(): void;
				l(nodes: unknown[]): void;
				m(target: Node, anchor: Node): void;
				p(changed: boolean, ctx: unknown): void;
			};
		};
		// $$events_def?: {};
		// $$prop_def?: {};
		// $$slot_def?: {};
		$capture_state(): unknown;
	};
};

type SvelteBlockDetail = {
	id: number;
	source: string;
	type:
		| 'anchor'
		| 'block'
		| 'catch'
		| 'component'
		| 'each'
		| 'element'
		| 'else'
		| 'if'
		| 'iteration'
		| 'key'
		| 'pending'
		| 'slot'
		| 'text'
		| 'then';

	detail?: unknown;
	tagName?: string;

	children: SvelteBlockDetail[];
	/** `type: 'element' | 'component'` */
	parent?: SvelteBlockDetail;
	/** like `parent` but `type: 'component'`  */
	container?: SvelteBlockDetail;

	block: SvelteComponentDetail['component']['$$']['fragment'];
	ctx: Array<unknown>; // TODO: do we need this typed?
};

