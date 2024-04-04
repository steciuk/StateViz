import React, { useContext } from 'react';
import { faAnglesUp, faAnglesDown } from '@fortawesome/free-solid-svg-icons';
import { ExpandAllUpdateContext } from '@pages/panel/contexts/ColapseContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const ActionsMenu = () => {
	const { collapseAll, expandAll } = useContext(ExpandAllUpdateContext);

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
		</div>
	);
};

