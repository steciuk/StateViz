<script lang="ts">
  import Button from "./Button.svelte";

  export let addTodo: (text: string) => void;

  let text = "";
</script>

<div class="add-todo">
  <input type="text" bind:value={text} placeholder="Enter a new todo..." />
  <Button
    onClick={() => {
      if (text.trim() === "") return;
      addTodo(text);
      text = "";
    }}
    disabled={text.trim() === ""}
  >
    Add
  </Button>
</div>
