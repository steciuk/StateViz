import { createContext, useState } from "react";

export const AgeContext = createContext<
  [age: number, updateAge: (age: number) => void] | null
>(null);

export const AgeProvider = ({ children }: { children: React.ReactNode }) => {
  const [age, setAge] = useState<number>(30);

  const updateAge = (age: number) => {
    setAge(age);
  };

  return (
    <AgeContext.Provider value={[age, updateAge]}>
      {children}
    </AgeContext.Provider>
  );
};
