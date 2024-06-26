import { useCallback, useRef, useState } from 'react';

const TreeNode = (props: { id: number; removeNode?: (id: number) => void }) => {
	const removeNodeFromParent = props.removeNode;

	const [treeNodes, setTreeNodes] = useState<number[]>([]);
	const nodeIdRef = useRef(0);

	const [counter, setCounter] = useState<number>(0);
  const [fib, next] = useFibonacci();

	const removeNode = useCallback((id: number) => {
		setTreeNodes((treeNodes) => treeNodes.filter((nodeId) => nodeId !== id));
	}, []);

	return (
		<div style={{ border: '1px solid black', padding: '1rem' }}>
			{props.id}
			{removeNodeFromParent && <button onClick={() => removeNodeFromParent(props.id)}>Remove</button>}
			<button
				onClick={() => {
					setTreeNodes([...treeNodes, nodeIdRef.current++]);
				}}
			>
				Add
			</button>
			{counter}
			<button onClick={() => setCounter(counter + 1)}>State</button>
      {fib}
      <button onClick={next}>Fib</button>
			<div
				style={{
					display: 'flex',
					justifyContent: 'space-evenly',
				}}
			>
				{treeNodes.map((nodeId) => (
					<TreeNode key={nodeId} id={nodeId} removeNode={removeNode} />
				))}
			</div>
		</div>
	);
};

function useFibonacci() {
  const [fib, setFib] = useState<number>(1);
  const prevRef = useRef<number>(0);

  const next = useCallback(() => {
    setFib((fib) => {
      const nextFib = fib + prevRef.current;
      prevRef.current = fib;
      return nextFib;
    });
  }, []);


  return [fib, next] as const;
}

export default TreeNode;
