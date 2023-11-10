/**
 * Copied from react repository
 * Types that are commented out are not used by StateViz
 * Comments starting with ? come from the react repository
 */

export enum WorkTag {
	FunctionComponent = 0,
	ClassComponent = 1,
	IndeterminateComponent = 2, // ? Before we know whether it is function or class
	HostRoot = 3, // ? Root of a host tree. Could be nested inside another node.
	HostPortal = 4, // ? A subtree. Could be an entry point to a different renderer.
	HostComponent = 5,
	HostText = 6,
	Fragment = 7,
	Mode = 8,
	ContextConsumer = 9,
	ContextProvider = 10,
	ForwardRef = 11,
	Profiler = 12,
	SuspenseComponent = 13,
	MemoComponent = 14,
	SimpleMemoComponent = 15,
	LazyComponent = 16,
	IncompleteClassComponent = 17,
	DehydratedFragment = 18,
	SuspenseListComponent = 19,
	ScopeComponent = 21,
	OffscreenComponent = 22,
	LegacyHiddenComponent = 23,
	CacheComponent = 24,
	TracingMarkerComponent = 25,
	HostHoistable = 26,
	HostSingleton = 27,
}

export type RefObject = {
	current: any;
};

// ? A Fiber is work on a Component that needs to be done or was done. There can
// ? be more than one per component.
export type Fiber = {
	// ? These first fields are conceptually members of an Instance. This used to
	// ? be split into a separate type and intersected with the other Fiber fields,
	// ? but until Flow fixes its intersection bugs, we've merged them into a
	// ? single type.

	// ? An Instance is shared between all versions of a component. We can easily
	// ? break this out into a separate object to avoid copying so much to the
	// ? alternate versions of the tree. We put this on a single object for now to
	// ? minimize the number of objects created during the initial render.

	// ? Tag identifying the type of fiber.
	tag: WorkTag;

	// ? Unique identifier of this child.
	key: null | string;

	// ? The value of element.type which is used to preserve the identity during
	// ? reconciliation of this child.
	elementType: any;

	// ? The resolved function/class/ associated with this fiber.
	type: any;

	// ? The local state associated with this fiber.
	stateNode: any;

	// ? Conceptual aliases
	// ? parent : Instance -> return The parent happens to be the same as the
	// ? return fiber since we've merged the fiber and instance.

	// ? Remaining fields belong to Fiber

	// ? The Fiber to return to after finishing processing this one.
	// ? This is effectively the parent, but there can be multiple parents (two)
	// ? so this is only the parent of the thing we're currently processing.
	// ? It is conceptually the same as the return address of a stack frame.
	return: Fiber | null;

	// ? Singly Linked List Tree Structure.
	child: Fiber | null;
	sibling: Fiber | null;
	index: number;

	// ? The ref last used to attach this node.
	// ? I'll avoid adding an owner field for prod and model that as functions.
	ref: null | (((handle: any) => void) & { _stringRef?: string }) | RefObject;

	refCleanup: null | (() => void);

	// ? Input is the data coming into process this fiber. Arguments. Props.
	pendingProps: any; // ? This type will be more specific once we overload the tag.
	memoizedProps: any; // ? The props used to create the output.

	// ? A queue of state updates and callbacks.
	updateQueue: any;

	// ? The state used to create the output
	memoizedState: any;

	// ? Dependencies (contexts, events) for this fiber, if it has any
	// ? dependencies: Dependencies | null,

	// ? Bitfield that describes properties about the fiber and its subtree. E.g.
	// ? the ConcurrentMode flag indicates whether the subtree should be async-by-
	// ? default. When a fiber is created, it inherits the mode of its
	// ? parent. Additional flags can be set at creation time, but after that the
	// ? value should remain unchanged throughout the fiber's lifetime, particularly
	// ? before its child fibers are created.
	// ? mode: TypeOfMode,

	// ? Effect
	flags: Flags;
	subtreeFlags: Flags;
	deletions: Array<Fiber> | null;

	// ? Singly linked list fast path to the next fiber with side-effects.
	nextEffect: Fiber | null;

	// ? The first and last fiber with side-effect within this subtree. This allows
	// ? us to reuse a slice of the linked list when we reuse the work done within
	// ? this fiber.
	firstEffect: Fiber | null;
	lastEffect: Fiber | null;

	lanes: number;
	childLanes: number;

	// ? This is a pooled version of a Fiber. Every fiber that gets updated will
	// ? eventually have a pair. There are cases when we can clean up pairs to save
	// ? memory if we need to.
	alternate: Fiber | null;

	// ? Time spent rendering this Fiber and its descendants for the current update.
	// ? This tells us how well the tree makes use of sCU for memoization.
	// ? It is reset to 0 each time we render and only updated when we don't bailout.
	// ? This field is only set when the enableProfilerTimer flag is enabled.
	actualDuration?: number;

	// ? If the Fiber is currently active in the "render" phase,
	// ? This marks the time at which the work began.
	// ? This field is only set when the enableProfilerTimer flag is enabled.
	actualStartTime?: number;

	// ? Duration of the most recent render time for this Fiber.
	// ? This value is not updated when we bailout for memoization purposes.
	// ? This field is only set when the enableProfilerTimer flag is enabled.
	selfBaseDuration?: number;

	// ? Sum of base times for all descendants of this Fiber.
	// ? This value bubbles up during the "complete" phase.
	// ? This field is only set when the enableProfilerTimer flag is enabled.
	treeBaseDuration?: number;

	// ? Conceptual aliases
	// ? workInProgress : Fiber ->  alternate The alternate used for reuse happens
	// ? to be the same as work in progress.
	// ? __DEV__ only

	// _debugSource?: Source | null,
	// _debugOwner?: Fiber | null,
	// _debugIsCurrentlyTiming?: boolean,
	// _debugNeedsRemount?: boolean,

	// ? Used to verify that the order of hooks does not change between renders.
	// _debugHookTypes?: Array<HookType> | null,
};

export type CurrentDispatcherRef = { current: null | any };

// TODO: currently not using RendererInterface at all
export type ReactRenderer = {
	// findFiberByHostInstance: (hostInstance: object) => Fiber | null;
	// version: string;
	// rendererPackageName: string;
	// // ? bundleType: BundleType,
	// // ? 16.9+
	// overrideHookState?: (
	// 	fiber: Fiber,
	// 	id: number,
	// 	path: Array<string | number>,
	// 	value: any
	// ) => void;
	// // ? 17+
	// overrideHookStateDeletePath?: (
	// 	fiber: Fiber,
	// 	id: number,
	// 	path: Array<string | number>
	// ) => void;
	// // ? 17+
	// overrideHookStateRenamePath?: (
	// 	fiber: Fiber,
	// 	id: number,
	// 	oldPath: Array<string | number>,
	// 	newPath: Array<string | number>
	// ) => void;
	// // ? 16.7+
	// overrideProps?: (
	// 	fiber: Fiber,
	// 	path: Array<string | number>,
	// 	value: any
	// ) => void;
	// // ? 17+
	// overridePropsDeletePath?: (
	// 	fiber: Fiber,
	// 	path: Array<string | number>
	// ) => void;
	// // ? 17+
	// overridePropsRenamePath?: (
	// 	fiber: Fiber,
	// 	oldPath: Array<string | number>,
	// 	newPath: Array<string | number>
	// ) => void;
	// // ? 16.9+
	// scheduleUpdate?: (fiber: Fiber) => void;
	// setSuspenseHandler?: (shouldSuspend: (fiber: Fiber) => boolean) => void;
	// // ? Only injected by React v16.8+ in order to support hooks inspection.
	// currentDispatcherRef?: CurrentDispatcherRef;
	// // ? Only injected by React v16.9+ in DEV mode.
	// // ? Enables DevTools to append owners-only component stack to error messages.
	// getCurrentFiber?: () => Fiber | null;
	// // ? 17.0.2+
	// reconcilerVersion?: string;
	// // ? Uniquely identifies React DOM v15.
	// ComponentTree?: any;
	// // ? Present for React DOM v12 (possibly earlier) through v15.
	// Mount?: any;
	// // ? Only injected by React v17.0.3+ in DEV mode
	// setErrorHandler?: (shouldError: (fiber: Fiber) => boolean) => void;
	// // ? Intentionally opaque type to avoid coupling DevTools to different Fast Refresh versions.
	// scheduleRefresh?: (...args: any[]) => any;
	// // ? 18.0+
	// // ? injectProfilingHooks?: (profilingHooks: DevToolsProfilingHooks) => void,
	// // ? getLaneLabelMap?: () => Map<Lane, string> | null,
};

export type BaseFiberRootProperties = {
	// ? The type of root (legacy, batched, concurrent, etc.)
	// tag: RootTag,

	// ? Any additional information from the host associated with this root.
	// containerInfo: Container,
	// ? Used only by persistent updates.
	// pendingChildren: any,
	// ? The currently active root fiber. This is the mutable root of the tree.
	current: Fiber;

	// pingCache: WeakMap<Wakeable, Set<mixed>> | Map<Wakeable, Set<mixed>> | null,

	// ? A finished work-in-progress HostRoot that's ready to be committed.
	// finishedWork: Fiber | null,
	// ? Timeout handle returned by setTimeout. Used to cancel a pending timeout, if
	// it's superseded by a new one.
	// timeoutHandle: TimeoutHandle | NoTimeout,
	// ? When a root has a pending commit scheduled, calling this function will
	// cancel it.
	// ? TODO: Can this be consolidated with timeoutHandle?
	// cancelPendingCommit: null | (() => void),
	// ? Top context object, used by renderSubtreeIntoContainer
	// context: Object | null,
	// pendingContext: Object | null,

	// ? Used to create a linked list that represent all the roots that have
	// ? pending work scheduled on them.
	// next: FiberRoot | null,

	// ? Node returned by Scheduler.scheduleCallback. Represents the next rendering
	// ? task that the root will work on.
	// callbackNode: any,
	// callbackPriority: Lane,
	// expirationTimes: LaneMap<number>,
	// hiddenUpdates: LaneMap<Array<ConcurrentUpdate> | null>,

	// pendingLanes: Lanes,
	// suspendedLanes: Lanes,
	// pingedLanes: Lanes,
	// expiredLanes: Lanes,
	// errorRecoveryDisabledLanes: Lanes,
	// shellSuspendCounter: number,

	// finishedLanes: Lanes,

	// entangledLanes: Lanes,
	// entanglements: LaneMap<Lanes>,

	// pooledCache: Cache | null,
	// pooledCacheLanes: Lanes,

	// ? TODO: In Fizz, id generation is specific to each server config. Maybe we
	// should do this in Fiber, too? Deferring this decision for now because
	// there's no other place to store the prefix except for an internal field on
	// the public createRoot object, which the fiber tree does not currently have
	// a reference to.
	// identifierPrefix: string,

	// onRecoverableError: (
	//   error: mixed,
	//   errorInfo: {digest?: ?string, componentStack?: ?string},
	// ) => void,
};

export type RendererID = number;

export type Handler = (data: any) => void;

export type DevToolsHook = {
	stateViz?: boolean;
	// listeners: { [key: string]: Array<Handler> };
	// rendererInterfaces: Map<RendererID, RendererInterface>,
	// renderers: Map<RendererID, ReactRenderer>;
	// backends: Map<string, DevToolsBackend>,

	supportsFiber: boolean;

	// emit: (event: string, data: any) => void;
	// getFiberRoots: (rendererID: RendererID) => Set<object>;
	inject: (renderer: ReactRenderer) => number | null;
	// on: (event: string, handler: Handler) => void;
	// off: (event: string, handler: Handler) => void;
	// reactDevtoolsAgent?: object;
	// sub: (event: string, handler: Handler) => () => void;

	// ? Used by react-native-web and Flipper/Inspector
	// resolveRNStyle?: ResolveNativeStyle,
	// nativeStyleEditorValidAttributes?: Array<string>;

	// ? React uses these methods.
	checkDCE: (fn: (...args: unknown[]) => unknown) => void;
	onCommitFiberUnmount: (rendererID: RendererID, fiber: object) => void;
	onCommitFiberRoot: (
		rendererID: RendererID,
		fiber: object,
		// ? Added in v16.9 to support Profiler priority labels
		commitPriority?: number,
		// ? Added in v16.9 to support Fast Refresh
		didError?: boolean
	) => void;

	// ? Timeline internal module filtering
	// getInternalModuleRanges: () => Array<[string, string]>;
	// registerInternalModuleStart: (moduleStartError: Error) => void;
	// registerInternalModuleStop: (moduleStopError: Error) => void;

	// ? Testing
	// dangerous_setTargetConsoleForTesting?: (fakeConsole: object) => void;
};
