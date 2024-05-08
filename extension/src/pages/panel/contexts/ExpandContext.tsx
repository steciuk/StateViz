import { createContext, useState } from 'react';

export const ExpandContext = createContext({ value: false });
export const ExpandUpdateContext = createContext({
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
		<ExpandContext.Provider value={expanded}>
			<ExpandUpdateContext.Provider value={{ collapseAll, expandAll }}>
				{props.children}
			</ExpandUpdateContext.Provider>
		</ExpandContext.Provider>
	);
};

