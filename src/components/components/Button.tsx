import { type ReactNode } from 'react';
import {
	getAnimationDurationMs, windowFadeOut
} from '@/frontend/windowTools';
import { getAction } from '@/backend/actions';

type IButtonProps = {
	children: ReactNode;
	className?: string;
	small?: boolean;
	type?: 'button' | 'reset' | 'submit' | undefined;
	form?: string;
	href?: string;
	onClick?: (event: React.MouseEvent<HTMLButtonElement>)=> void;
	onClickAction?: string;
};

const click = (
	props: IButtonProps,
	event: React.MouseEvent<HTMLButtonElement>
) => {

	props.onClick?.(event);

	if (props.onClickAction) {

		const action = getAction(props.onClickAction);
		if (!action)
			throw new Error('Could not find action string.');
		action();

	}
	if (props.href) {

		windowFadeOut();
		setTimeout(
			() => {

				window.location.href = props.href || '';

			},
			getAnimationDurationMs()
		);

	}

};

export const Button = (props: IButtonProps) => {

	return (
		<button
			className={`${props.small
				? 'h-10 w-18 text-lg'
				: 'h-20 w-40 text-2xl'} shrink-0 cursor-pointer rounded-md border-2 border-solid border-white ${props.className}`}
			type={props.type}
			form={props.form}
			onClick={(e) => {

				click(
					props,
					e
				);

			}}
		>
			{props.children}
		</button>
	);

};
