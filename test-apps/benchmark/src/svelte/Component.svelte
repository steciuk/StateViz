<script lang="ts">
  export let name: string;

  let count: number = 0;
</script>

<div>
  <h2>{name}</h2>
  <button on:click={() => (count += 1)}>Increment</button>
  <p>Counter: {count}</p>
</div>
