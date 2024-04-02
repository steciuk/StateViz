<script lang="ts">
  export let name: string;

  let list1: number[] = [];
  let list2: number[] = [];
</script>

<div>
  <h2>{name}</h2>
  <div>
    <button on:click={() => (list1 = [...list1, list1.length])}
      >Add to list 1</button
    >
    <button on:click={() => (list2 = [...list2, list2.length])}
      >Add to list 2</button
    >
  </div>
  <div>
    <h3>List 1</h3>
    <ul>
      {#each list1 as item (item)}
        <li>{item}</li>
      {/each}
    </ul>
    <h3>List 2</h3>
    <ul>
      {#each list2 as item (item)}
        <li>{item}</li>
      {/each}
    </ul>
  </div>
</div>
