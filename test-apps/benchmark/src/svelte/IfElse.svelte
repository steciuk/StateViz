<script lang="ts">
  export let name: string;

  let condition: boolean = true;
</script>

<div>
  <h2>{name}</h2>
  {#if condition}
    <p>True</p>
  {:else}
    <p>False</p>
  {/if}
  <button on:click={() => (condition = !condition)}>Toggle</button>
</div>
