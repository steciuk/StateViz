<script lang="ts">
  export let id: number;
  export let removeNode: ((id: number) => void) | undefined = undefined;

  let currentId: number = 0;
  let treeNodes: number[] = [];
  let count: number = 0;

  const remove = (idToRemove: number) => {
    treeNodes = treeNodes.filter((nodeId) => nodeId !== idToRemove);
  };
</script>

<div style:border="1px solid black" style:padding="1rem">
  {id}
  {#if removeNode}
    <button on:click={() => removeNode && removeNode(id)}>Remove</button>
  {/if}
  <button
    on:click={() => {
      treeNodes = [...treeNodes, currentId];
      currentId += 1;
    }}
  >
    Add</button
  >
  {count}
  <button on:click={() => (count += 1)}>State</button>
  <div class="children-container">
    {#each treeNodes as nodeId (nodeId)}
      <svelte:self id={nodeId} removeNode={remove} />
    {/each}
  </div>
</div>

<style>
  .children-container {
    display: flex;
    justify-content: space-evenly;
  }
</style>
