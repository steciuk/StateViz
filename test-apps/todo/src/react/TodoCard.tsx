import { Todo } from "../defaultTodos";
import classNames from "classnames";
import { Button } from "./Button";

export const TodoCard = (props: {
  todo: Todo;
  toggleTodo: (id: number) => void;
  increasePriority: (id: number) => void;
  decreasePriority: (id: number) => void;
}) => {
  const { todo, toggleTodo, increasePriority, decreasePriority } = props;

  return (
    <div
      className={classNames("todo-card", {
        "todo-card-completed": todo.isCompleted,
      })}
      data-priority={todo.priority}
    >
      <p className="todo-card-text">{todo.text}</p>
      <div className="todo-card-buttons">
        <Button onClick={() => toggleTodo(todo.id)}>
          {todo.isCompleted ? "Undo" : "Complete"}
        </Button>
        <div className="priority-wrapper">
          <Button
            onClick={() => decreasePriority(todo.id)}
            disabled={todo.isCompleted || todo.priority <= 0}
          >
            -
          </Button>
          <span className="priority-text" style={{ marginInline: "0.3rem" }}>
            {todo.priority}
          </span>
          <Button
            onClick={() => increasePriority(todo.id)}
            disabled={todo.isCompleted || todo.priority >= 5}
          >
            +
          </Button>
        </div>
      </div>
    </div>
  );
};
