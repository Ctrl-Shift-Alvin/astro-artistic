import { type ReactNode } from 'react';
import {
	windowFadeIn,
	windowFadeOut
} from '@/frontend/windowTools';

type IAProps = {
	children: ReactNode;
	className?: string;
	href?: string;
	target?: '_blank' | '_self' | '_parent' | '_top' | undefined;
	onClick?: (mouseEvent: React.MouseEvent<HTMLAnchorElement>)=> void;
	key?: string;
};

const hrefClicked = (
	clickEvent: React.MouseEvent<HTMLAnchorElement>,
	props: IAProps
) => {

	if (props.onClick)
		props.onClick(clickEvent);
	if (props.href) {

		void windowFadeOut().then(() => {

			if (props.target === '_blank') {

				window.open(
					props.href,
					'_blank'
				);

			} else {

				window.location.href = props.href || '';

			}
			windowFadeIn();

		});

	}

};

export const A = (props: IAProps) => (
	<a
		key={props.key}
		className={`cursor-pointer ${props.className}`}
		target={props.target}
		onClick={(e) => {

			hrefClicked(
				e,
				props
			);

		}}
	>
		{props.children}
	</a>
);
