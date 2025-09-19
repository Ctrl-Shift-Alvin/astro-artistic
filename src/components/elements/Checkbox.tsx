import clsx from 'clsx/lite';
import {
	useMemo,
	type InputHTMLAttributes
} from 'react';

export const Checkbox = (props: InputHTMLAttributes<HTMLInputElement>) => {

	const processedprops = useMemo(
		() => ({
			...props,
			type: 'checkbox',
			className: clsx(
				'max-w-fit size-5',
				props.className
			)
		}),
		[ props ]
	);

	return (
		<input {...processedprops}>
			{props.children}
		</input>
	);

};
