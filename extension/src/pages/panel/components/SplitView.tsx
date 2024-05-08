import { SelectedNodeContext } from '@pages/panel/contexts/SelectedNodeContext';
import classNames from 'classnames';
import React, {
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

const MIN_WIDTH = 200;
const INIT_WIDTH = 400;

export const SplitView = (props: { left: ReactNode; right: ReactNode }) => {
	const selectedNode = useContext(SelectedNodeContext);

	const [leftWidth, setLeftWidth] = useState<number>(INIT_WIDTH);
	const leftRef = useRef<HTMLDivElement>(null);

	const [separatorXPosition, setSeparatorXPosition] = useState<
		undefined | number
	>(undefined);

	const [dragging, setDragging] = useState(false);

	const onMouseDown = (e: React.MouseEvent) => {
		setSeparatorXPosition(e.clientX);
		setDragging(true);
	};

	const onMouseMove = useCallback(
		(e: MouseEvent) => {
			if (dragging && separatorXPosition !== undefined) {
				e.preventDefault();

				const newLeftWidth = Math.max(
					leftWidth + e.clientX - separatorXPosition,
					MIN_WIDTH
				);
				setSeparatorXPosition(e.clientX);
				setLeftWidth(newLeftWidth);
			}
		},
		[dragging, separatorXPosition, leftWidth]
	);

	const onMouseUp = useCallback(() => {
		setDragging(false);
	}, []);

	useEffect(() => {
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
	}, [onMouseMove, onMouseUp]);

	useEffect(() => {
		if (leftRef.current) {
			leftRef.current.style.width = `${leftWidth}px`;
		}
	}, [leftWidth]);

	return (
		<div className="flex h-full w-full items-start">
			<div
				className={classNames('h-full overflow-auto', {
					// TODO: this should not be here. Make it generic
					'flex-grow': selectedNode === null,
				})}
				ref={leftRef}
			>
				{props.left}
			</div>
			{/* FIXME: this also should not be here */}
			{selectedNode && (
				<>
					<div
						className="h-full w-0.5 cursor-col-resize bg-secondary"
						onMouseDown={onMouseDown}
					/>
					<div className="h-full w-0 flex-shrink flex-grow overflow-auto">
						{props.right}
					</div>
				</>
			)}
		</div>
	);
};

