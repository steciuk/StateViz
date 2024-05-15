import React from 'react';

export const Link = (props: { href: string; children: React.ReactNode }) => {
	return (
		<a
			href={props.href}
			target="_blank"
			rel="noreferrer"
			className="text-primary hover:underline"
		>
			{props.children}
		</a>
	);
};

