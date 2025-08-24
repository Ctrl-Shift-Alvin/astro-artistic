import { type ReactNode } from 'react';
import {
	windowFadeIn,
	windowFadeOut
} from '@/frontend/windowTools';
import {
	getAction,
	TAction
} from '@/shared/actions';

type IButtonProps = {
	children: ReactNode;
	className?: string;
	small?: boolean;
	type?: 'button' | 'reset' | 'submit' | undefined;
	form?: string;
	href?: string;
	onClick?: (event: React.MouseEvent<HTMLButtonElement>)=> void;
	onClickAction?: TAction;
};

const click = (
	props: IButtonProps,
	event: React.MouseEvent<HTMLButtonElement>
) => {

	props.onClick?.(event);

	if (props.onClickAction) {

		getAction(props.onClickAction)();

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

};

export const Button = (props: IButtonProps) => {

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

					click(
						props,
						e
					);

				}
			}
		>
			{props.children}
		</button>
	);

};
