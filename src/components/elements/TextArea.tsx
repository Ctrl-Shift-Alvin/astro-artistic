import clsx from 'clsx/lite';
import {
	useMemo,
	type TextareaHTMLAttributes
} from 'react';

/**
 * A styled `<textarea>` element.
 */
export const TextArea = (props: TextareaHTMLAttributes<HTMLTextAreaElement>) => {

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
		<textarea {...processedprops}>
			{props.children}
		</textarea>
	);

};
