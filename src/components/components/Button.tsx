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

export type TButtonProps = {
	children: ReactNode;
	className?: string;
	small?: boolean;
	type?: 'button' | 'reset' | 'submit';
	form?: string;
	href?: string;
	onClick?: (event: React.MouseEvent<HTMLButtonElement>)=> void;
	actionPayload?: TActionPayload;
};

export const Button = (props: TButtonProps) => {

	const click = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {

			props.onClick?.(event);

			if (props.actionPayload) {

				if (isSyncPayload(props.actionPayload)) {

					executeAction(props.actionPayload);

				} else {

					void executeAsyncAction(props.actionPayload);

				}

			}

			if (props.href) {

				void windowFadeOut()
					.then(() => {

						window.location.href = props.href || '';

					})
					.then(() => {

						windowFadeIn();

					});

			}

		},
		[ props ]
	);

	return (
		<button
			className={
				`${props.small
					? 'h-10 w-18 text-lg'
					: 'h-20 w-40 text-2xl'} shrink-0 cursor-pointer rounded-md border-2 border-solid border-white ${props.className}`
			}
			type={props.type}
			form={props.form}
			onClick={
				(e) => {

					click(e);

				}
			}
		>
			{props.children}
		</button>
	);

};
