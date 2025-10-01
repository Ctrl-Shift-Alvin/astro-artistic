import clsx from 'clsx/lite';
import {
	useMemo,
	type InputHTMLAttributes
} from 'react';

/**
 * A styled `<input>`.
 */
export const Input = (props: InputHTMLAttributes<HTMLInputElement>) => {

	const processedprops = useMemo(
		() => ({
			...props,
			className: clsx(
				'block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white',
				'outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6',
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
