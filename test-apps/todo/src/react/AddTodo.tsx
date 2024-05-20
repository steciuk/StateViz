import React from "react";
import { Button } from "./Button";

export const AddTodo = (props: { addTodo: (text: string) => void }) => {
  const [text, setText] = React.useState("");

  return (
    <div className="add-todo">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter a new todo..."
      />
      <Button
        onClick={() => {
          if (text.trim() === "") return;
          props.addTodo(text);
          setText("");
        }}
        disabled={text.trim() === ""}
      >
        Add
      </Button>
    </div>
  );
};
