export type SvelteDevToolsHook = {
  v: Set<string>
}

export interface SvelteEventMap {
  SvelteRegisterComponent: {
    detail: unknown
  }
  SvelteRegisterBlock: {
    detail: unknown
  }
  SvelteDOMInsert: {
    detail: unknown
  }
  SvelteDOMRemove: {
    detail: unknown
  }
  SvelteDOMAddEventListener: {
    detail: unknown
  }
  SvelteDOMRemoveEventListener: {
    detail: unknown
  }
  SvelteDOMSetData: {
    detail: unknown
  }
  SvelteDOMSetProperty: {
    detail: unknown
  }
  SvelteDOMSetAttribute: {
    detail: unknown
  }
  SvelteDOMRemoveAttribute: {
    detail: unknown
  }
}