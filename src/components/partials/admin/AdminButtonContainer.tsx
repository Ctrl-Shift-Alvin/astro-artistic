import {
	useEffect,
	useState
} from 'react';
import {
	Button,
	type TButtonProps
} from '@/components/elements/Button';
import { Emitter } from '@/components/types';
import { isWindowDefined } from '@/frontend/windowTools';

const ADMIN_BUTTON_CONTAINER_ID = 'adminButtonContainer';

type ButtonUpdater = (buttons: TButtonProps[])=> TButtonProps[];

declare global {

	interface Window {
		// eslint-disable-next-line @typescript-eslint/naming-convention
		__adminButtonState?: {
			emitter: Emitter<ButtonUpdater>;
			queued: TButtonProps[];
		};
	}
}

/**
 * We attach the state to the global `window` object to ensure a true singleton
 * across all module instances, which can be a problem with some bundlers and
 * framework integrations (like Astro islands).
 * This now uses a simple event emitter pattern.
 */
function getButtonState() {

	if (!isWindowDefined()) {

		throw new Error('This function can only be called on the client!');

	}
	window.__adminButtonState ??= {
		emitter: new Emitter<ButtonUpdater>(),
		queued: []
	};
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

	if (state.emitter.hasListener()) {

		state.emitter.emit(updater);

	} else {

		state.queued = updater(state.queued);

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
		buttons,
		setButtons
	] = useState<TButtonProps[]>(
		() => {

			// Merge initial server-side buttons with any client-side buttons that were queued before mount.
			const clientButtonIds = new Set(state.queued.map(getButtonId));
			const uniqueInitialButtons = initialButtons.filter((btn) => !clientButtonIds.has(getButtonId(btn)));
			return [
				...uniqueInitialButtons,
				...state.queued
			];

		}
	);

	useEffect(
		() => {

			// Subscribe to the emitter, applying any updates to the component's state.
			state.emitter.subscribe(setButtons);

			// Unsubscribe on unmount.
			return () => {

				state.emitter.unsubscribe();

			};

		},
		[ state.emitter ] // Dependency on the emitter object itself.
	);

	return (
		buttons.length > 0
		&& (
			<div
				id={ADMIN_BUTTON_CONTAINER_ID}
				className={'sticky bottom-0 left-0 right-0 p-4 flex flex-row justify-start gap-x-5 bg-gray/20'}
			>
				{
					buttons.map(
						(btn) => (
							<Button
								key={getButtonId(btn)}
								small={btn.small ?? true}
								href={btn.href}
								onClick={btn.onClick}
							>
								{btn.children}
							</Button>
						)
					)
				}
			</div>
		)
	);

};
