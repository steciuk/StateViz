<script lang="ts">
  import { defaultTodos } from "../defaultTodos";
  import type { Todo } from "../defaultTodos";
  import AddTodo from "./AddTodo.svelte";
  import TodoCard from "./TodoCard.svelte";

  let todos: Todo[] = defaultTodos;

  function addTodo(text: string) {
    todos = [
      ...todos,
      { id: todos.length + 1, text, isCompleted: false, priority: 0 },
    ];
  }

  function toggleTodo(id: number) {
    todos = todos.map((todo) =>
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    );
  }

  function increasePriority(id: number) {
    todos = todos.map((todo) =>
      todo.id === id
        ? { ...todo, priority: Math.min(todo.priority + 1, 5) }
        : todo
    );
  }

  function decreasePriority(id: number) {
    todos = todos.map((todo) =>
      todo.id === id
        ? { ...todo, priority: Math.max(todo.priority - 1, 0) }
        : todo
    );
  }
</script>

<div class="app">
  <h1>Svelte Todos</h1>
  <AddTodo {addTodo} />
  <div class="todo-list">
    {#each todos as todo (todo.id)}
      <TodoCard {todo} {toggleTodo} {increasePriority} {decreasePriority} />
    {/each}
  </div>
</div>
