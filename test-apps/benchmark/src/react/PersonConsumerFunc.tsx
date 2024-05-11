import { useContext } from "react";
import { NameContext } from "./contexts/NameContext";
import { AgeContext } from "./contexts/AgeContext";

export const PersonConsumerFunc = () => {
  const [name, updateName] = useContext(NameContext)!;
  const [age, updateAge] = useContext(AgeContext)!;

  return (
    <>
      <div>
        <h2>PersonConsumerFunc</h2>
        <p>Name: {name}</p>
        <p>Age: {age}</p>
      </div>

      <div>
        <label>Name: </label>
        <input
          type="text"
          onChange={(e) => updateName(e.target.value)}
          value={name}
        />
        <label>Age: </label>
        <input
          type="number"
          onChange={(e) => updateAge(parseInt(e.target.value))}
          value={age}
        />
      </div>
    </>
  );
};
