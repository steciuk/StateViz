<script lang="ts">
  export let name: string;

  let list1: number[] = [];
  let list2: number[] = [];
</script>

<div>
  <h2>{name}</h2>
  <div>
    <button on:click={() => (list1 = [...list1, list1.length])}
      >Append to list 1</button
    >
    <button on:click={() => (list2 = [...list2, list2.length])}
      >Append to list 2</button
    >
    <button on:click={() => (list1 = [list1.length, ...list1])}
      >Prepend to list 1</button
    >
    <button on:click={() => (list2 = [list2.length, ...list2])}
      >Prepend to list 2</button
    >
  </div>
  <div>
    <h3>Separated eaches</h3>
    <h4>List 1</h4>
    <ul>
      {#each list1 as item (item)}
        <li>{item}</li>
      {/each}
    </ul>
    <h4>List 2</h4>
    <ul>
      {#each list2 as item (item)}
        <li>{item}</li>
      {/each}
    </ul>
  </div>
  <div>
    <h3>Side by side eaches</h3>
    <ul>
      {#each list1 as item1 (item1)}
        <li>
          {item1}
        </li>
      {/each}
      {#each list2 as item2 (item2)}
        <li>
          {item2}
        </li>
      {/each}
    </ul>
  </div>
</div>
