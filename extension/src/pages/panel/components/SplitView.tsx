import { SelectedNodeContext } from '@pages/panel/contexts/SelectedNodeContext';
import classNames from 'classnames';
import React, {
	ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react';

const MIN_WIDTH = 200;

export const SplitView = (props: { left: ReactNode; right: ReactNode }) => {
	const selectedNodeAndLibrary = useContext(SelectedNodeContext);

	const [leftWidth, setLeftWidth] = useState<number>(400);
	const leftRef = useRef<HTMLDivElement>(null);

	const [separatorXPosition, setSeparatorXPosition] = useState<
		undefined | number
	>(undefined);

	const [dragging, setDragging] = useState(false);

	const onMouseDown = (e: React.MouseEvent) => {
		setSeparatorXPosition(e.clientX);
		setDragging(true);
	};

	const onMouseMove = (e: MouseEvent) => {
		e.preventDefault();
		if (dragging && separatorXPosition !== undefined) {
			const newLeftWidth = Math.max(
				leftWidth + e.clientX - separatorXPosition,
				MIN_WIDTH
			);
			setSeparatorXPosition(e.clientX);
			setLeftWidth(newLeftWidth);
		}
	};

	const onMouseUp = () => {
		setDragging(false);
	};

	useEffect(() => {
		document.addEventListener('mousemove', onMouseMove);
		document.addEventListener('mouseup', onMouseUp);

		return () => {
			document.removeEventListener('mousemove', onMouseMove);
			document.removeEventListener('mouseup', onMouseUp);
		};
	});

	useEffect(() => {
		if (leftRef.current) {
			leftRef.current.style.width = `${leftWidth}px`;
		}
	}, [leftRef, leftWidth]);

	return (
		<div className="flex h-full w-full items-start">
			<div
				className={classNames('h-full overflow-auto', {
					'flex-grow': selectedNodeAndLibrary === null,
				})}
				ref={leftRef}
			>
				{props.left}
			</div>
			{selectedNodeAndLibrary && (
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

