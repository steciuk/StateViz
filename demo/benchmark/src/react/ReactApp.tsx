import { FunctionComponent } from "./FunctionComponent";
import { ClassComponent } from "./ClassComponent";
import { MemoComponent } from "./MemoComponent";

export function ReactApp() {
  return (
    <div>
      <h1>React</h1>
      <FunctionComponent name="Function Component" />
      <ClassComponent name="Class Component" />
      <MemoComponent name="Memo Component" />
      <>
        <p>Fragment</p>
      </>
    </div>
  );
}
