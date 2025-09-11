import {
	useCallback, type ReactNode
} from 'react';
import {
	windowFadeIn,
	windowFadeOut
} from '@/frontend/windowTools';
import {
	executeAction,
	executeAsyncAction,
	isSyncPayload,
	type TActionPayload
} from '@/shared/actions';

type IAProps = {
	children: ReactNode;
	className?: string;
	href?: string;
	target?: '_blank' | '_self' | '_parent' | '_top';
	onClick?: (mouseEvent: React.MouseEvent<HTMLAnchorElement>)=> void;
	actionPayload?: TActionPayload;
	key?: string;
};

export const A = (props: IAProps) => {

	const clicked = useCallback(
		(clickEvent: React.MouseEvent<HTMLAnchorElement>) => {

			props.onClick?.(clickEvent);

			if (props.actionPayload) {

				if (isSyncPayload(props.actionPayload)) {

					executeAction(props.actionPayload);

				} else {

					void executeAsyncAction(props.actionPayload);

				}

			}

			if (props.href) {

				// Prevent default anchor behavior if we're handling navigation with fades
				clickEvent.preventDefault();

				void windowFadeOut().then(() => {

					if (props.target === '_blank') {

						window.open(
							props.href,
							'_blank'
						);

						// Fade the current window back in after opening a new tab
						windowFadeIn();

					} else {

						// Let the browser navigate, the fade out provides a nice transition
						window.location.href = props.href || '';

					}

				});

			}

		},
		[ props ]
	);

	return (
		<a
			key={props.key}
			href={props.href}
			className={`cursor-pointer ${props.className}`}
			target={props.target}
			onClick={
				(e) => {

					clicked(e);

				}
			}
		>
			{props.children}
		</a>
	);

};
