import classNames from 'classnames';
import React from 'react';

import { faAngleRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export const ExpandArrow = (props: {
	isExpanded: boolean;
	onClick: (expanded: boolean) => void;
	disabled?: boolean;
	className?: string;
}) => {
	return (
		<FontAwesomeIcon
			icon={faAngleRight}
			className={classNames(props.className, 'transition-transform', {
				'text-disabled': props.disabled,
				'text-primary': !props.disabled,
				'rotate-90': props.isExpanded,
				'cursor-pointer': !props.disabled,
			})}
			onClick={(e) => {
				if (props.disabled) return;
				e.stopPropagation();
				props.onClick(!props.isExpanded);
			}}
		/>
	);
};
