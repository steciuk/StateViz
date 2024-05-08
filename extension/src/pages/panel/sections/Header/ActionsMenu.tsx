import React, { useContext } from 'react';
import { faAnglesUp, faAnglesDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import useStorage from '@src/shared/hooks/useStorage';
import indentSizeStorage from '@pages/panel/storages/indentSizeStorage';
import { ExpandUpdateContext } from '@pages/panel/contexts/ExpandContext';

export const ActionsMenu = () => {
	const indentSize = useStorage(indentSizeStorage);
	const { collapseAll, expandAll } = useContext(ExpandUpdateContext);

	const handleIndentChange = (value: string) => {
		const parsedValue = parseInt(value);
		if (isNaN(parsedValue)) return;

		indentSizeStorage.set(parsedValue);
	};

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
				<input
					className="w-full accent-primary"
					type="range"
					min="0"
					max="50"
					value={indentSize}
					onChange={(e) => handleIndentChange(e.target.value)}
				/>
			</div>
		</div>
	);
};

