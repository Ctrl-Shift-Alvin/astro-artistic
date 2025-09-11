import {
	useEffect, useMemo, useState, type Dispatch, type SetStateAction
} from 'react';
import {
	Button, type TButtonProps
} from '@/components/components/Button';
import { isWindowDefined } from '@/frontend/windowTools';

const ADMIN_BUTTON_CONTAINER_ID = 'adminButtonContainer';

interface AdminButtonState {
	setter: Dispatch<SetStateAction<TButtonProps[]>> | null;
	buttons: TButtonProps[];
}

declare global {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	interface Window { __adminButtonState?: AdminButtonState }
}

/**
 * We attach the state to the global `window` object to ensure a true singleton
 * across all module instances, which can be a problem with some bundlers and
 * framework integrations (like Astro islands).
 */
function getButtonState(): AdminButtonState {

	if (!isWindowDefined()) {

		throw new Error('This function can only be called on the client!');

	}
	if (!window.__adminButtonState) {

		window.__adminButtonState = {
			setter: null,
			buttons: []
		};

	}
	return window.__adminButtonState;

}

const getButtonId = (button: TButtonProps) => {

	if (typeof button.children === 'string') {

		return button.children;

	}
	return JSON.stringify(button.children);

};

/**
 * Add buttons to the admin container. Duplicates are ignored.
 * @param newButtons The buttons to add.
 */
export const addAdminButton = (...newButtons: TButtonProps[]) => {

	if (!isWindowDefined()) {

		return;

	}
	const state = getButtonState();

	const updater = (existingButtons: TButtonProps[]) => {

		const newButtonIds = new Set(newButtons.map(getButtonId));

		// Filter out old buttons that are being replaced
		const filteredExisting = existingButtons.filter((btn) => !newButtonIds.has(getButtonId(btn)));

		return [
			...filteredExisting,
			...newButtons
		];

	};

	if (state.setter) {

		state.setter(updater);

	} else {

		state.buttons = updater(state.buttons);

	}

};

/**
 * Manages a global button container that displays buttons from two sources:
 * 1. Server-side: Initial buttons passed as props from an Astro file.
 * 2. Client-side: Buttons added at runtime from other React components.
 *
 * This is necessary for buttons whose `onClick` handlers need access to client-side
 * React state or context (e.g., a "Save" button for a form).
 *
 * A singleton-like state manager within this module handles this:
 * - `addAdminButton()` can be called from any client component at any time
 */
export const AdminButtonContainer = ({ buttons: initialButtons = [] }: { buttons?: TButtonProps[] }) => {

	const state = getButtonState();
	const [
		clientButtons,
		setClientButtons
	] = useState<TButtonProps[]>(state.buttons);

	useEffect(
		() => {

			state.setter = setClientButtons;

			// In case buttons were added before this component mounted
			setClientButtons(state.buttons);

			// Clear setters, leave buttons untouched
			return () => {

				state.setter = null;

			};

		},
		[ state ]
	);

	const allButtons = useMemo(
		() => {

			const clientButtonIds = new Set(clientButtons.map(getButtonId));

			// Filter out initialButtons that are already present in clientButtons
			const uniqueInitialButtons = initialButtons.filter((btn) => !clientButtonIds.has(getButtonId(btn)));

			return [
				...uniqueInitialButtons,
				...clientButtons
			];

		},
		[
			initialButtons,
			clientButtons
		]
	);

	return (
		allButtons.length > 0
		&& (
			<div
				id={ADMIN_BUTTON_CONTAINER_ID}
				className={'sticky bottom-0 left-0 right-0 p-4 flex flex-row justify-start gap-x-5 bg-gray/20'}
			>
				{
					allButtons.map((btn) => (
						<Button
							key={getButtonId(btn)}
							small={btn.small ?? true}
							href={btn.href}
							onClick={btn.onClick}
						>
							{btn.children}
						</Button>
					))
				}
			</div>
		)
	);

};
