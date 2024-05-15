import { Link } from '@src/shared/components/Link';
import React from 'react';

export const Footer = () => {
	return (
		<footer className="flex justify-between">
			<p>
				Made by{' '}
				<Link href="https://www.linkedin.com/in/steciuk/">Adam Steciuk</Link>
			</p>
			<p>
				Version:{' '}
				<Link href="https://github.com/steciuk/state-viz">{VERSION}</Link>
			</p>
		</footer>
	);
};

