export type Todo = {
  id: number;
  text: string;
  isCompleted: boolean;
  priority: number;
};

export const defaultTodos = [
  {
    id: 1,
    text: "Create a universal developer tool",
    isCompleted: false,
    priority: 1,
  },
  {
    id: 2,
    text: "Meet friend for lunch",
    isCompleted: false,
    priority: 2,
  },
  {
    id: 3,
    text: "Build really cool todo app",
    isCompleted: false,
    priority: 3,
  },
];
