import { FunctionComponent } from "./FunctionComponent";
import { ClassComponent } from "./ClassComponent";
import { MemoComponent } from "./MemoComponent";
import { SuspenseComponent } from "./SuspenseComponent";
import { HooksComponent } from "./HooksComponent";
import { NameProvider } from "./contexts/NameContext";
import { PersonConsumerFunc } from "./PersonConsumerFunc";
import { AgeProvider } from "./contexts/AgeContext";
import { PersonConsumerClass } from "./PersonConsumerClass";

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
      <SuspenseComponent name="Suspense Component" />
      <HooksComponent />
      <NameProvider>
        <AgeProvider>
          <PersonConsumerFunc />
          <PersonConsumerClass />
        </AgeProvider>
      </NameProvider>
    </div>
  );
}
