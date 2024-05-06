<script lang="ts">
  import Component from "./Component.svelte";

  let showComponent = false;
</script>

<h2>RegisterComponent</h2>
{#if showComponent}
  <Component name="Seen" />
{/if}

<button on:click={() => (showComponent = true)}>Show Seen</button>
