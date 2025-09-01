import React, {
	type ReactNode, useCallback, useEffect, useState
} from 'react';
import {
	DialogPopup, type DialogButton
} from './DialogPopup';
import { DialogConfig } from '@/shared/config/dialog';

type DialogOptions = {
	title: ReactNode;
	body: ReactNode;
	buttons: DialogButton[];
	onBackdropClick?: ()=> void;
};

class DialogEmitter {

	private listener: ((options: DialogOptions)=> void) | null = null;

	subscribe(l: (options: DialogOptions)=> void) {

		this.listener = l;

	}

	unsubscribe() {

		this.listener = null;

	}

	emit(options: DialogOptions) {

		this.listener?.(options);

	}

}

const dialogEmitter = new DialogEmitter();

function FormWrapper<T>({
	form,
	onStateChange
}: {
	form: {
		body: (formValues: T, setFormValues: (newValues: T)=> void)=> ReactNode;
		initialValue: T;
	};
	onStateChange: (newState: T)=> void;
}) {

	const [
		formValues,
		setFormValues
	] = useState(form.initialValue);

	useEffect(
		() => {

			onStateChange(formValues);

		},
		[
			formValues,
			onStateChange
		]
	);

	return (
		<>
			{
				form.body(
					formValues,
					setFormValues
				)
			}
		</>
	);

}

/**
 * Class with static helper functions for creating dialogs. The DOM must have the DialogProvider component.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Dialog {

	/**
	 * If the other helper methods do not suit your needs, use this to create a custom dialog.
	 * @param options The custom options used to create the dialog
	 */
	static show(options: DialogOptions): void {

		dialogEmitter.emit(options);

	}

	/**
	 * Closes the currently open dialog.
	 */
	// eslint-disable-next-line @typescript-eslint/no-empty-function
	static close = () => {};

	/**
	 * Shows a dialog with a title, body and an OK button.
	 * @returns A promise that resolves when the OK button (or the backdrop) was pressed.
	 */
	static ok(
		title: ReactNode,
		body: ReactNode
	): Promise<void> {

		return new Promise((resolve) => {

			this.show({
				title,
				body,
				buttons: [
					{
						text: 'OK',
						onClick: () => {

							if (DialogConfig.closeOnButtonClick)
								this.close();

							resolve();

						}
					}
				]
			});

		});

	}

	/**
	 * Shows a dialog with a title, body and two buttons that default to 'Yes' and 'No'.
	 * @param opts Optional parameter to change the text of the 'Yes' or 'No' buttons.
	 * @returns A promise that resolves to true when 'Yes' was pressed, otherwise false.
	 */
	static yesNo(
		title: ReactNode,
		body: ReactNode,
		opts: {
			yesText?: string;
			noText?: string;
		} = {}
	): Promise<boolean> {

		return new Promise((resolve) => {

			this.show({
				title,
				body,
				buttons: [
					{
						text: opts.noText || 'No',
						onClick: () => {

							if (DialogConfig.closeOnButtonClick)
								this.close();
							resolve(false);

						}
					},
					{
						text: opts.yesText || 'Yes',
						onClick: () => {

							if (DialogConfig.closeOnButtonClick)
								this.close();
							resolve(true);

						}
					}
				]
			});

		});

	}

	/**
	 * Shows a dialog with a custom form component, a 'Submit' and 'Cancel' button.
	 * Provide a type that can represent your form element values, and an initial value.
	 * @param form.body A function that returns the form. Use 'formValues' to bind the form element values.
	 * @param form.initialValue Initial value of type T used to instantiate a prop that will be passed to body at first.
	 * @param onSubmit Callback for the 'Submit' button. Use 'formValues' to validate and return true to close the form.
	 * @returns A promise that resolves with the 'form.onSubmit' return value
	 */
	static form<T>(
		title: ReactNode,
		form: {
			body: (formValues: T, setFormValues: (newValues: T)=> void)=> ReactNode;
			onSubmit: (formValues: T)=> boolean;
			initialValue: T;
		},
		opts: {
			submitText?: string;
			cancelText?: string;
		} = {}
	): Promise<T | null> {

		return new Promise((resolve) => {

			let latestFormValues: T = form.initialValue;
			const handleStateChange = (newState: T) => {

				latestFormValues = newState;

			};

			this.show({
				title,
				body: (
					<FormWrapper
						form={form}
						onStateChange={handleStateChange}
					/>
				),
				buttons: [
					{
						text: opts.cancelText || 'Cancel',
						onClick: () => {

							if (DialogConfig.closeOnButtonClick)
								this.close();

							resolve(null);

						}
					},
					{
						text: opts.submitText || 'Submit',
						onClick: () => {

							const result = form.onSubmit(latestFormValues);
							if (result) {

								if (DialogConfig.closeOnButtonClick)
									this.close();

								resolve(latestFormValues);

							}

							// If onSubmit returns false, the dialog remains open, so no resolve() here

						}
					}
				]
			});

		});

	}

}

/**
 * The dialog provider that has to be present for the helper functions to work. Best place it in Base.astro.
 */
export const DialogProvider: React.FC = () => {

	const [
		options,
		setOptions
	] = useState<DialogOptions | null>(null);

	const hideDialogCallback = useCallback(
		() => {

			setOptions(null);

		},
		[]
	);
	Dialog.close = hideDialogCallback;

	useEffect(
		() => {

			const listener = (opts: DialogOptions) => {

				setOptions({
					...opts,
					onBackdropClick: () => {

						if (DialogConfig.closeOnBackdropClick)
							hideDialogCallback();

						opts.onBackdropClick?.();

					}
				});

			};
			dialogEmitter.subscribe(listener);

			return () => {

				dialogEmitter.unsubscribe();

			};

		},
		[ hideDialogCallback ]
	);

	return (
		<DialogPopup
			isOpen={!!options}
			title={options?.title}
			buttons={options?.buttons || []}
			onBackdropClick={options?.onBackdropClick}
		>
			{options?.body}
		</DialogPopup>
	);

};
