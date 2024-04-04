import { createContext, useState } from 'react';

export const ExpandAllContext = createContext({ value: false });
export const ExpandAllUpdateContext = createContext({
	collapseAll: () => {},
	expandAll: () => {},
});

export const ExpandProvider = (props: { children: React.ReactNode }) => {
	// wrapped in object, so it triggers re-render
	const [expanded, setExpanded] = useState({ value: false });

	const expandAll = () => {
		setExpanded({ value: true });
	};

	const collapseAll = () => {
		setExpanded({ value: false });
	};

	return (
		<ExpandAllContext.Provider value={expanded}>
			<ExpandAllUpdateContext.Provider value={{ collapseAll, expandAll }}>
				{props.children}
			</ExpandAllUpdateContext.Provider>
		</ExpandAllContext.Provider>
	);
};

