import React, { useState, Suspense, lazy } from "react";

export const SuspenseComponent = (props: { name: string }) => {
  const [showLazyComponent, setShowLazyComponent] = useState(false);

  return (
    <div>
      <h2>{props.name}</h2>
      <Suspense fallback={<FallBack />}>
        {showLazyComponent && <SlowComponent />}
      </Suspense>
      <button onClick={() => setShowLazyComponent(true)}>Show lazy</button>
    </div>
  );
};

const SlowComponent = lazy(async () => {
  await new Promise((resolve) => setTimeout(resolve, 6000));

  return { default: () => <div>Slow component</div> };
});

const FallBack = () => {
  return <div>Loading...</div>;
};
