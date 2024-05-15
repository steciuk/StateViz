import React from 'react';

export const Info = (props: { children: React.ReactNode }) => {
	return (
		<div className="grid h-full w-full place-items-center">
			<div className="flex max-w-md flex-col items-center gap-2 text-center">
				{props.children}
			</div>
		</div>
	);
};

