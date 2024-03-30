import { memo, useState } from "react";

export const MemoComponent = memo(function MemoComponent(props: {
  name: string;
}) {
  const [counter, setCounter] = useState(0);

  return (
    <div>
      <h2>{props.name}</h2>
      <button onClick={() => setCounter(counter + 1)}>Increment</button>
      <p>Counter: {counter}</p>
    </div>
  );
});
