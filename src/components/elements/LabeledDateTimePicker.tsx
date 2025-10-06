import {
	type LabelHTMLAttributes,
	type ReactNode
} from 'react';
import DatePicker, { type DatePickerProps } from 'react-datepicker';
import clsx from 'clsx';
import { Label } from './Label';

type TLabeledDatePickerProps = DatePickerProps & {
	labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
	children?: ReactNode;
};

/**
 * A bound Label and DatePicker configured for both date and time. (no div at the top)
 * @param labelProps Any props that get assigned to the `Label` component.
 * @param children Gets assigned to the body of the `Label` component.
 * @param datePickerProps All other props get assigned to the `Input` component.
 */
export const LabeledDateTimePicker = ({
	labelProps,
	children,
	...datePickerProps
}: TLabeledDatePickerProps) => {

	return (
		<>
			<Label
				{...labelProps}
				htmlFor={datePickerProps.id}
			>
				{children ?? 'Date/Time'}
			</Label>

			<div className={'mt-2'}>
				<DatePicker
					{...datePickerProps}
					toggleCalendarOnIconClick
					showTimeInput
					showTimeSelect
					dateFormat={'PPPPp zzzz'}
					timeIntervals={15}
					wrapperClassName={'w-full'}
					className={
						clsx(
							'block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white',
							'outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6',
							datePickerProps.className
						)
					}
				/>
			</div>
		</>
	);

};
