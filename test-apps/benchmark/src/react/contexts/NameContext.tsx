import { createContext, useState } from "react";

export const NameContext = createContext<
  [name: string, updateName: (name: string) => void] | null
>(null);

export const NameProvider = ({ children }: { children: React.ReactNode }) => {
  const [name, setName] = useState<string>("John Doe");

  const updateName = (name: string) => {
    setName(name);
  };

  return (
    <NameContext.Provider value={[name, updateName]}>
      {children}
    </NameContext.Provider>
  );
};
