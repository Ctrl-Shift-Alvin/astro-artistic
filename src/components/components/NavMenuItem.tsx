import { type ReactNode } from 'react';
import { A } from './A';

export const NavMenuItem = ({
	href,
	children
}: {
	href: string;
	children: ReactNode;
}) => {

	return window.location.pathname === href
		? (
			<li key={href}>
				<p className={'text-xl font-bold'}>
					{children}
				</p>
			</li>
		)
		:	(
			<li key={href}>
				<A
					href={href}
					className={'text-lg'}
				>
					{children}
				</A>
			</li>
		);

};
