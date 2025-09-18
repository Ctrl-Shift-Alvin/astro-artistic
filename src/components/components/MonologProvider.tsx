import {
	useState,
	useEffect,
	useCallback
} from 'react';
import {
	MonologPopup,
	type TMonologProps
} from './MonologPopup';

export class MonologEmitter {

	nextId: number = 0;

	private listener: ((options: TMonologProps)=> void) | null = null;

	subscribe(l: (options: TMonologProps)=> void) {

		this.listener = l;

	}

	unsubscribe() {

		this.listener = null;

	}

	emit(options: TMonologProps) {

		this.listener?.(options);

	}

}
const monologEmitter = (() => {

	if (!window.monologEmitter) {

		window.monologEmitter = new MonologEmitter();

	}
	return window.monologEmitter;

})();

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Monolog {

	static show({
		text,
		durationMs = 2000,
		fadeDurationMs = 500,
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

	static showAsync({
		text,
		durationMs = 2000,
		fadeDurationMs = 500,
		className
	}: {
		text: string;
		durationMs?: number;
		fadeDurationMs?: number;
		className?: string;
	}): Promise<void> {

		return new Promise((resolve) => {

			monologEmitter.emit({
				text,
				durationMs,
				fadeDurationMs,
				className,
				onClose: resolve
			});

		});

	}

}

export const MonologProvider = () => {

	const [
		monologs,
		setMonologs
	] = useState<(TMonologProps & { id: number })[]>([]);

	const removeMonolog = useCallback(
		(id: number) => {

			setMonologs((prevMonologs) => prevMonologs.filter((m) => m.id !== id));

		},
		[]
	);

	useEffect(
		() => {

			const listener = (options: TMonologProps) => {

				if (monologs.length >= 3) {

					setMonologs((prev) => {

						return prev.slice(-2);

					});

				}

				const id = monologEmitter.nextId++;
				const onClose = () => {

					removeMonolog(id);
					options.onClose?.();

				};

				setMonologs((prevMonologs) => [
					...prevMonologs,
					{
						...options,
						id,
						onClose
					}
				]);

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
				monologs.map((m) => (
					<MonologPopup
						key={m.id}
						text={m.text}
						durationMs={m.durationMs}
						fadeDurationMs={m.fadeDurationMs}
						className={m.className}
						onClose={m.onClose}
					/>
				))
			}
		</div>
	);

};
