import {
	useCallback,
	type ReactNode
} from 'react';
import clsx from 'clsx/lite';
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
	onClick?: (ev: React.MouseEvent<HTMLButtonElement>)=> void;
	actionPayload?: TActionPayload;
};

/**
 * A styled `<button>` element with extra 'Action' functionality and href animations.
 *
 * @see actions.ts
 */
export const Button = (props: TButtonProps) => {

	const click = useCallback(
		(ev: React.MouseEvent<HTMLButtonElement>) => {

			props.onClick?.(ev);

			if (props.actionPayload) {

				if (isSyncPayload(props.actionPayload)) {

					executeAction(props.actionPayload);

				} else {

					void executeAsyncAction(props.actionPayload);

				}

			}

			if (props.href) {

				void windowFadeOut().then(
					() => {

						window.location.href = props.href ?? '';

					}
				).then(
					() => {

						windowFadeIn();

					}
				);

			}

		},
		[ props ]
	);

	return (
		<button
			className={
				clsx(
					props.small ?? false
						? 'h-10 w-18 text-lg'
						: 'h-20 w-40 text-2xl',
					'shrink-0 cursor-pointer rounded-md border-2 border-solid border-white',
					props.className
				)
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
