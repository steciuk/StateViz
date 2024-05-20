<script lang="ts">
  import type { Todo } from "../defaultTodos";
  import Button from "./Button.svelte";

  export let todo: Todo;
  export let toggleTodo: (id: number) => void;
  export let increasePriority: (id: number) => void;
  export let decreasePriority: (id: number) => void;
</script>

<div
  class="todo-card"
  data-priority={todo.priority}
  class:todo-card-completed={todo.isCompleted}
>
  <p class="todo-card-text">
    {todo.text}
  </p>
  <div class="todo-card-buttons">
    <Button onClick={() => toggleTodo(todo.id)}>
      {todo.isCompleted ? "Undo" : "Complete"}
    </Button>
    <div class="priority-wrapper">
      <Button
        onClick={() => decreasePriority(todo.id)}
        disabled={todo.isCompleted || todo.priority <= 0}
      >
        -
      </Button>
      <span class="priority-text">{todo.priority}</span>
      <Button
        onClick={() => increasePriority(todo.id)}
        disabled={todo.isCompleted || todo.priority >= 5}
      >
        +
      </Button>
    </div>
  </div>
</div>
