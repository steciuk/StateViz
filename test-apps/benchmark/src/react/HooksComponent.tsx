import React, { useCallback, useDebugValue, useState } from "react";

export const HooksComponent = () => {
  const [isOn, toggle] = useToggle(false);

  return (
    <div>
      <h2>Hooks Component</h2>
      <button onClick={toggle}>{isOn ? "on" : "off"}</button>
    </div>
  );
};

function useToggle(initialValue: boolean) {
  const [value, setValue] = useState(initialValue);
  useDebugValue(value ? "on" : "off");
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle] as const;
}
