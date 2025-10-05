import React, {
	type ReactNode,
	useCallback,
	useEffect,
	useState
} from 'react';
import { Emitter } from '../types';
import {
	DialogPopup,
	type DialogButton
} from './DialogPopup';
import { DialogConfig } from '@/shared/config/dialog';
import { isWindowDefined } from '@/frontend/windowTools';

type TDialogOptions = {
	title: ReactNode;
	body: ReactNode;
	buttons: DialogButton[];
	onBackdropClick?: ()=> void;
};

const dialogEmitter = isWindowDefined()
	? (() => {

		if (!window.dialogEmitter) {

			window.dialogEmitter = new Emitter<TDialogOptions>();

		}
		return window.dialogEmitter;

	})()
	: new Emitter<TDialogOptions>();

/**
 * Class with static helper functions for creating dialogs. The DOM must have the DialogProvider component.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Dialog {

	/**
	 * If the other helper methods do not suit your needs, use this to create a custom dialog.
	 * @param options The custom options used to create the dialog
	 */
	static show(options: TDialogOptions): void {

		dialogEmitter.emit(options);

	}

	/**
	 * Closes the currently open dialog.
	 */
	static close = () => { /* Will be assigned */ };

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
	 * @param form.body.onSubmit The callback that tries to resolve the dialog, equal to the 'Submit' button callback.
	 * @param form.body.onSubmit The callback that cancels the dialog, equal to the 'Cancel' button callback.
	 * @param form.initialValue Initial value of type T used to instantiate a prop that will be passed to body at first.
	 * @param onSubmit Callback for the 'Submit' button. Use 'formValues' to validate and return true to close the form.
	 * @returns A promise that resolves with the 'form.onSubmit' return value (when 'Submit' is clicked).
	 */
	static form<T>(
		title: ReactNode,
		form: {
			// eslint-disable-next-line @typescript-eslint/max-params
			body: (
				formValues: T,
				setFormValues: (newValues: T)=> void,
				onSubmit: (event: React.SyntheticEvent)=> void,
				onCancel: (event: React.SyntheticEvent)=> void
			)=> ReactNode;
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

			// The callback for submitting the form
			const submitCallback = (event: React.SyntheticEvent) => {

				event.preventDefault();

				// If the onSubmit callback returns true, resolve the promise
				const result = form.onSubmit(latestFormValues);
				if (result) {

					if (DialogConfig.closeOnButtonClick)
						this.close();

					resolve(latestFormValues);

				}

				// Otherwise, the dialog remains open, so no resolve() here

			};

			// The callback for cancelling the form
			const cancelCallback = (event: React.SyntheticEvent) => {

				event.preventDefault();

				if (DialogConfig.closeOnButtonClick)
					this.close();

				resolve(null);

			};

			const FormBody = () => {

				const [
					formValues,
					setFormValues
				] = useState(form.initialValue);

				useEffect(
					() => {

						handleStateChange(formValues);

					},
					[ formValues ]
				);

				return form.body(
					formValues,
					setFormValues,
					submitCallback,
					cancelCallback
				);

			};

			const dialogButtons = [
				{
					text: opts.cancelText || 'Cancel',
					onClick: cancelCallback
				},
				{
					text: opts.submitText || 'Submit',
					onClick: submitCallback,
					type: 'submit'
				}
			] as DialogButton[];

			this.show({
				title,
				body: <FormBody />,
				buttons: dialogButtons
			});

		});

	}

}

/**
 * The component that has to be present for the DialogProvider helper functions to work.
 */
export const DialogProvider: React.FC = () => {

	const [
		options,
		setOptions
	] = useState<TDialogOptions | null>(null);

	const hideDialogCallback = useCallback(
		() => {

			setOptions(null);

		},
		[]
	);

	useEffect(
		() => {

			const listener = (opts: TDialogOptions) => {

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
			Dialog.close = hideDialogCallback;

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
