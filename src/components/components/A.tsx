import { type ReactNode } from 'react';
import {
	getAnimationDurationMs,
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

		if (props.target === '_blank') {

			windowFadeOut();
			setTimeout(
				() => {

					window.open(
						props.href,
						'_blank'
					);
					windowFadeIn();

				},
				getAnimationDurationMs()
			);
			return;

		}
		windowFadeOut();
		setTimeout(
			() => {

				window.location.href = props.href || '';

			},
			getAnimationDurationMs()
		);

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
