import {
	useState,
	useEffect,
	useCallback
} from 'react';
import { Emitter } from '../types';
import { MonologPopup } from './MonologPopup';
import {
	DEFAULT_ANIMATION_DURATION_MS,
	isWindowDefined
} from '@/frontend/windowTools';

export type TMonologOptions = {
	text: string;
	durationMs: number;
	fadeDurationMs: number;
	className?: string;
	onClose?: ()=> void;
};

const monologEmitter = isWindowDefined()
	? (() => {

		window.monologEmitter ??= new Emitter<TMonologOptions>();
		return window.monologEmitter;

	})()
	: new Emitter<TMonologOptions>();

/**
 * Class with static helper functions for creating monologs. The DOM must have the MonologProvider component.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Monolog {

	/**
	 * Create and show a monolog popup.
	 *
	 * @param durationMs The duration (ms) *between* the fade-in and fade-out animations.
	 * @param fadeDurationMs The duration (ms) for both the fade-in and fade-out animations.
	 * 	Defaults to `DEFAULT_ANIMATION_DURATION_MS`.
	 */
	static show({
		text,
		durationMs = 2000,
		fadeDurationMs = DEFAULT_ANIMATION_DURATION_MS,
		className
	}: {
		text: string;
		durationMs?: number;
		fadeDurationMs?: number;
		className?: string;
	}): void {

		monologEmitter.emit({
			text,
			durationMs,
			fadeDurationMs,
			className
		});

	}

	/**
	 * Asynchronously create and show a monolog popup.
	 *
	 * @param durationMs The duration (ms) *between* the fade-in and fade-out animations.
	 * @param fadeDurationMs The duration (ms) for both the fade-in and fade-out animations.
	 * 	Defaults to `DEFAULT_ANIMATION_DURATION_MS`.
	 * @returns A promise that finishes when the popup has completely disappeared. (After `durationMs + 2*fadeDurationMs`)
	 */
	static showAsync({
		text,
		durationMs = 2000,
		fadeDurationMs = DEFAULT_ANIMATION_DURATION_MS,
		className
	}: {
		text: string;
		durationMs?: number;
		fadeDurationMs?: number;
		className?: string;
	}): Promise<void> {

		return new Promise(
			(resolve) => {

				monologEmitter.emit({
					text,
					durationMs,
					fadeDurationMs,
					className,
					onClose: resolve
				});

			}
		);

	}

}

/**
 * The component that has to be present for the MonologProvider helper functions to work.
 */
export const MonologProvider = () => {

	const [
		monologs,
		setMonologs
	] = useState<(TMonologOptions & { id: string })[]>([]);

	const removeMonolog = useCallback(
		(id: string) => {

			setMonologs((prevMonologs) => prevMonologs.filter((m) => m.id !== id));

		},
		[]
	);

	useEffect(
		() => {

			const listener = (options: TMonologOptions) => {

				const id = crypto.randomUUID();
				const newElement = {
					...options,
					id,
					onClose: () => {

						removeMonolog(id);
						options.onClose?.();

					}
				};

				/*
				 * If the max length is reached,
				 * keep the last 2 elements and append the new one
				 */
				if (monologs.length >= 3) {

					setMonologs(
						(prev) => [
							...prev.slice(-2),
							newElement
						]
					);

				} else {

					setMonologs(
						(prev) => [
							...prev,
							newElement
						]
					);

				}

			};

			monologEmitter.subscribe(listener);

			return () => {

				monologEmitter.unsubscribe();

			};

		},
		[
			monologs,
			removeMonolog
		]
	);

	return (
		<div
			id={'monologContainer'}
			className={'fixed w-2/3 left-1/2 -translate-x-1/2 bottom-0 flex flex-col items-center justify-end my-2 gap-y-4'}
		>
			{
				monologs.map(
					(m) => (
						<MonologPopup
							key={m.id}
							text={m.text}
							durationMs={m.durationMs}
							fadeDurationMs={m.fadeDurationMs}
							className={m.className}
							onClose={m.onClose}
						/>
					)
				)
			}
		</div>
	);

};
