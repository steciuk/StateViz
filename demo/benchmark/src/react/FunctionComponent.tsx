import { useState } from "react";

export function FunctionComponent(props: { name: string }) {
  const [counter, setCounter] = useState(0);

  return (
    <div>
      <h2>{props.name}</h2>
      <button onClick={() => setCounter(counter + 1)}>Increment</button>
      <p>Counter: {counter}</p>
    </div>
  );
}
