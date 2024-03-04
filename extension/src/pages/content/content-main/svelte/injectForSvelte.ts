export function injectForSvelte() {
  // TODO: come up with an idea that doesn't need directly waiting for svelte to load
  window.setTimeout(() => {
    const versions = [...(window.__svelte?.v ?? [])]

    if (versions.length === 0) {
      console.log('No Svelte versions found')
      return
    } else {
      console.log('Svelte versions:', versions)
    }
  }, 3000)
}