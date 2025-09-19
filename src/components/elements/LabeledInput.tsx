import {
	type InputHTMLAttributes,
	type LabelHTMLAttributes,
	type ReactNode
} from 'react';
import { Label } from './Label';
import { Input } from './Input';

type TLabeledInputProps = InputHTMLAttributes<HTMLInputElement> & {
	labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
	children: ReactNode;
};

/**
 * A bound Label and Input. (no div at the top)
 * @param labelProps Any props that get assigned to the `Label` component.
 * @param children Gets assigned to the body of the `Label` component.
 * @param inputProps All other props get assigned to the `Input` component.
 */
export const LabeledInput = ({
	labelProps,
	children,
	...inputProps
}: TLabeledInputProps) => {

	return (
		<>
			<Label
				{...labelProps}
				htmlFor={inputProps.id}
			>
				{children}
			</Label>

			<div className={'mt-2'}>
				<Input
					children={undefined}
					{...inputProps}
				/>
			</div>
		</>
	);

};
