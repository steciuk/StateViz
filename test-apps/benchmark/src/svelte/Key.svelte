<script lang="ts">
  import Component from "./Component.svelte";

  export let name: string;

  let count: number = 0;
</script>

<div>
  <h2>{name}</h2>
  <button on:click={() => (count += 1)}>Change key</button>
  {#key count}
    <Component name="Component" />
  {/key}
</div>
