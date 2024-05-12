import React, { useContext, useEffect, useState } from 'react';
import { faAnglesUp, faAnglesDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useStorage from '@src/shared/hooks/useStorage';
import indentSizeStorage from '@pages/panel/storages/indentSizeStorage';
import { ExpandUpdateContext } from '@pages/panel/contexts/ExpandContext';
import './ActionsMenu.scss';

export const ActionsMenu = () => {
	const storedIndentSize = useStorage(indentSizeStorage);
	const { collapseAll, expandAll } = useContext(ExpandUpdateContext);
	const [indentSize, setIndentSize] = useState(storedIndentSize);

	const handleIndentChange = (value: string) => {
		const parsedValue = parseInt(value);
		if (isNaN(parsedValue)) return;

		setIndentSize(parsedValue);
	};

	useEffect(() => {
		if (storedIndentSize === indentSize) return;

		const updateStorage = setTimeout(() => {
			indentSizeStorage.set(indentSize);
		}, 700);

		return () => {
			clearTimeout(updateStorage);
		};
	}, [indentSize, storedIndentSize]);

	return (
		<div className="flex items-center gap-2">
			<FontAwesomeIcon
				icon={faAnglesDown}
				className="cursor-pointer text-xl text-primary"
				onClick={expandAll}
			/>
			<FontAwesomeIcon
				icon={faAnglesUp}
				className="cursor-pointer text-xl text-primary"
				onClick={collapseAll}
			/>
			<div className="min-w-[4rem]">
				<label className="indent-range-container relative">
					<input
						className="w-full accent-primary"
						type="range"
						min="0"
						max="50"
						value={indentSize}
						onChange={(e) => handleIndentChange(e.target.value)}
					/>
					<span className="absolute m-auto hidden bg-secondary p-0.5 text-center text-xs">
						{indentSize}px
					</span>
				</label>
			</div>
		</div>
	);
};

