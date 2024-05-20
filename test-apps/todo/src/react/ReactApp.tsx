import { useState } from "react";
import { Todo, defaultTodos } from "../defaultTodos";
import { TodoCard } from "./TodoCard";
import { AddTodo } from "./AddTodo";

export function ReactApp() {
  const [todos, setTodos] = useState<Todo[]>(defaultTodos);

  const addTodo = (text: string) => {
    setTodos((prevTodos) => [
      ...prevTodos,
      {
        id: prevTodos.length + 1,
        text,
        isCompleted: false,
        priority: 0,
      },
    ]);
  };

  const toggleTodo = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const increasePriority = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? { ...todo, priority: Math.min(todo.priority + 1, 5) }
          : todo
      )
    );
  };

  const decreasePriority = (id: number) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id
          ? { ...todo, priority: Math.max(todo.priority - 1, 0) }
          : todo
      )
    );
  };

  return (
    <div className="app">
      <h1>React Todos</h1>
      <AddTodo addTodo={addTodo} />
      <div className="todo-list">
        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            toggleTodo={toggleTodo}
            increasePriority={increasePriority}
            decreasePriority={decreasePriority}
          />
        ))}
      </div>
    </div>
  );
}
