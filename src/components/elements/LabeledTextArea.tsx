import {
	type LabelHTMLAttributes,
	type ReactNode,
	type TextareaHTMLAttributes
} from 'react';
import { Label } from './Label';
import { TextArea } from './TextArea';

type TLabeledTextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	labelProps?: LabelHTMLAttributes<HTMLLabelElement>;
	children: ReactNode;
};

/**
 * A bound Label and TextArea. (no div at the top)
 * @param labelProps Any props that get assigned to the `Label` component.
 * @param children Gets assigned to the body of the `Label` component.
 * @param inputProps All other props get assigned to the `TextArea` component.
 */
export const LabeledTextArea = ({
	labelProps,
	children,
	...inputProps
}: TLabeledTextAreaProps) => {

	return (
		<>
			<Label
				{...labelProps}
				htmlFor={inputProps.id}
			>
				{children}
			</Label>

			<div className={'mt-2'}>
				<TextArea
					children={undefined}
					{...inputProps}
				/>
			</div>
		</>
	);

};
