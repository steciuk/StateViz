export function injectForSvelte() {
  // TODO: come up with an idea that doesn't need directly waiting for svelte to load
  window.setTimeout(() => {
    const versions = [...(window.__svelte?.v ?? [])]

    if (versions.length === 0) {
      console.log('No Svelte versions found')
      return
    } else {
      console.log('Svelte versions:', versions)
      inject()
    }
  }, 3000)
}

function inject() {
  // window.addEventListener('SvelteRegisterComponent', ({ detail }) => {
  //   console.log('SvelteRegisterComponent', detail)
  // })
  // window.addEventListener('SvelteRegisterBlock', ({ detail }) => {
  //   console.log('SvelteRegisterBlock', detail)
  // })
  // window.addEventListener('SvelteDOMInsert', ({ detail }) => {
  //   console.log('SvelteDOMInsert', detail)
  // })
  // window.addEventListener('SvelteDOMRemove', ({ detail }) => {
  //   console.log('SvelteDOMRemove', detail)
  // })
  // window.addEventListener('SvelteDOMAddEventListener', ({ detail }) => {
  //   console.log('SvelteDOMAddEventListener', detail)
  // })
  // window.addEventListener('SvelteDOMRemoveEventListener', ({ detail }) => {
  //   console.log('SvelteDOMRemoveEventListener', detail)
  // })
  // window.addEventListener('SvelteDOMSetData', ({ detail }) => {
  //   console.log('SvelteDOMSetData', detail)
  // })
  // window.addEventListener('SvelteDOMSetProperty', ({ detail }) => {
  //   console.log('SvelteDOMSetProperty', detail)
  // })
  // window.addEventListener('SvelteDOMSetAttribute', ({ detail }) => {
  //   console.log('SvelteDOMSetAttribute', detail)
  // })
  // window.addEventListener('SvelteDOMRemoveAttribute', ({ detail }) => {
  //   console.log('SvelteDOMRemoveAttribute', detail)
  // })

}