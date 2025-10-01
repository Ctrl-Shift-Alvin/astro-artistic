import clsx from 'clsx/lite';
import {
	useMemo,
	type LabelHTMLAttributes
} from 'react';

/**
 * A styled `<label>` element.
 */
export const Label = (props: LabelHTMLAttributes<HTMLLabelElement>) => {

	const processedprops = useMemo(
		() => ({
			...props,
			className: clsx(
				'block text-sm/6 font-medium text-white',
				props.className
			)
		}),
		[ props ]
	);

	return (
		<label {...processedprops}>
			{props.children}
		</label>
	);

};
