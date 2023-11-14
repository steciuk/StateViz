import { useCallback, useRef, useState } from 'react';

const TreeNode = (props: { id: number; removeNode?: (id: number) => void }) => {
	const removeNodeFromParent = props.removeNode;

	const [treeNodes, setTreeNodes] = useState<number[]>([]);
	const nodeIdRef = useRef(0);

	const removeNode = useCallback((id: number) => {
		setTreeNodes((treeNodes) => treeNodes.filter((nodeId) => nodeId !== id));
	}, []);

	return (
		<div style={{ border: '1px solid black', padding: '1rem' }}>
			{props.id}
			{removeNodeFromParent && (
				<button onClick={() => removeNodeFromParent(props.id)}>Remove</button>
			)}
			<button
				onClick={() => {
					setTreeNodes([...treeNodes, nodeIdRef.current++]);
				}}
			>
				Add
			</button>
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

export default TreeNode;
