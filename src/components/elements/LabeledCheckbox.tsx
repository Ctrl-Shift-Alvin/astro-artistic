import {
	type InputHTMLAttributes,
	type LabelHTMLAttributes,
	type ReactNode
} from 'react';
import { Label } from './Label';
import { Checkbox } from './Checkbox';

type TLabeledInputProps = InputHTMLAttributes<HTMLInputElement> & {
	labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
	children: ReactNode;
};

/**
 * A bound Label and Checkbox. (no div at the top)
 * @param labelProps Any props that get assigned to the `Label` component.
 * @param children Gets assigned to the body of the `Label` component.
 * @param checkboxProps All other props get assigned to the `Checkbox` component.
 */
export const LabeledCheckbox = ({
	labelProps,
	children,
	...checkboxProps
}: TLabeledInputProps) => {

	return (
		<>
			<Label
				{...labelProps}
				htmlFor={checkboxProps.id}
			>
				{children}
			</Label>

			<Checkbox
				children={undefined}
				{...checkboxProps}
			/>
		</>
	);

};
