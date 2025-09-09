import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import {
	deleteBuild,
	deleteContactForm,
	deleteError
} from '@/frontend/protectedApi';
import {
	goto,
	windowRefresh
} from '@/frontend/windowTools';
import { cSetIgnoreSizeError } from '@/shared/cookies';

const actions = {
	sizeErrorIgnore: () => {

		cSetIgnoreSizeError(true);
		windowRefresh();

	},
	toggleExpand500ErrorDiv: () => {

		const div = document.getElementById('errorDiv');
		if (!div) {

			throw new Error('Failed to get errorDiv and expand!');

		}

		if (div.classList.contains('opacity-100')) {

			div.classList.replace(
				'opacity-100',
				'opacity-0'
			);

		} else {

			div.classList.replace(
				'opacity-0',
				'opacity-100'
			);

		}

	},
	adminDeleteContactSubmission: async(id: number | string) => {

		const result = await Dialog.yesNo(
			'Are you sure you want to delete this contact submission?',
			`This will irreversibly remove the contact submission with ID ${id}.`
		);

		if (!result)
			return;

		const deleteResult = await deleteContactForm(id);

		if (deleteResult) {

			Monolog.show({
				text: `Successfully deleted contact submission with ID '${id}'!`,
				durationMs: 2000
			});
			setTimeout(
				() => {

					goto('/admin/home/');

				},
				2000
			);

		} else {

			Monolog.show({
				text: `Failed to delete contact submission with ID '${id}'!`,
				durationMs: 2000
			});

		}

	},
	adminDeleteBuild: async(buildNumber: number | string) => {

		const result = await Dialog.yesNo(
			'Are you sure you want to delete this build?',
			`This will irreversibly remove the build with ID ${buildNumber}.`
			+ (window.__BUILD__.buildNumber === buildNumber
				? ' This is the current running build!'
				: '')
		);

		if (!result)
			return;

		const deleteResult = await deleteBuild(buildNumber);

		if (deleteResult) {

			Monolog.show({
				text: `Successfully deleted build with ID '${buildNumber}'!`,
				durationMs: 2000
			});
			setTimeout(
				() => {

					goto('/admin/home/');

				},
				2000
			);

		} else {

			Monolog.show({
				text: `Failed to delete build with ID '${buildNumber}'!`,
				durationMs: 2000
			});

		}

	},
	adminDeleteError: async(id: number | string) => {

		const result = await Dialog.yesNo(
			'Are you sure you want to delete this error?',
			`This will irreversibly remove the error with ID ${id}.`
		);

		if (!result)
			return;

		const deleteResult = await deleteError(id);

		if (deleteResult) {

			Monolog.show({
				text: `Successfully deleted error with ID '${id}'!`,
				durationMs: 2000
			});
			setTimeout(
				() => {

					goto('/admin/home/');

				},
				2000
			);

		} else {

			Monolog.show({
				text: `Failed to delete error with ID '${id}'!`,
				durationMs: 2000
			});

		}

	},
	adminDeleteEvent: async(id: number | string) => {

		const result = await Dialog.yesNo(
			'Are you sure you want to delete this event entry?',
			`This will irreversibly remove the error with ID ${id}.`
		);

		if (!result)
			return;

		const deleteResult = await deleteEventsEntry(id);

		if (deleteResult) {

			Monolog.show({
				text: `Successfully deleted event entry with ID '${id}'!`,
				durationMs: 2000
			});
			setTimeout(
				() => {

					goto('/admin/home/');

				},
				2000
			);

		} else {

			Monolog.show({
				text: `Failed to delete event entry with ID '${id}'!`,
				durationMs: 2000
			});

		}

	}
} as const;

export type TAction = typeof actions;
export type TActionType = keyof TAction;

export const getAction = (actionName: TActionType) => {

	return actions[actionName];

};

// Async or not?
type IsAsyncFunc<T> = T extends (...args: any[])=> Promise<any> ? true : false;

/**
 * The names of all synchronous actions.
 */
export type TSyncActionType = {
	[K in TActionType]: IsAsyncFunc<TAction[K]> extends false ? K : never
}[TActionType];

/**
 * The names of all async actions.
 */
export type TAsyncActionType = {
	[K in TActionType]: IsAsyncFunc<TAction[K]> extends true ? K : never
}[TActionType];

/**
 * A discriminated union for synchronous actions and their arguments.
 * If the action has no parameters, the `args` property is optional.
 */
export type TSyncActionPayload = {
	[K in TSyncActionType]: { action: K } & (
		Parameters<TAction[K]>['length'] extends 0
			? { args?: [] }
			: { args: Parameters<TAction[K]> }
	)
}[TSyncActionType];

/**
 * A discriminated union for async actions and their arguments.
 * If the action has no parameters, the `args` property is optional.
 */
export type TAsyncActionPayload = {
	[K in TAsyncActionType]: { action: K } & (
		Parameters<TAction[K]>['length'] extends 0
			? { args?: [] }
			: { args: Parameters<TAction[K]> }
	)
}[TAsyncActionType];

/**
 * A discriminated union for all actions (sync and async) and their arguments.
 */
export type TActionPayload = TSyncActionPayload | TAsyncActionPayload;

/**
 * Type guard to check if the payload is for a synchronous action
 */
export function isSyncPayload(payload: TActionPayload): payload is TSyncActionPayload {

	return syncActionKeys.has(payload.action);

}

/**
 * Executes a synchronous action from a payload object.
 * @param payload The synchronous action payload.
 */
export const executeAction = (payload: TSyncActionPayload) => {

	const func = getAction(payload.action);

	/*
	 * The TSyncActionPayload type guarantees this call is safe.
	 * We cast to a generic function type to satisfy TypeScript's inference limitations.
	 */
	(func as (...args: any[])=> void)(...payload.args || []);

};

/**
 * Executes an asynchronous action from a payload object.
 * @param payload The asynchronous action payload.
 * @returns The promise returned by the async action.
 */
export const executeAsyncAction = (payload: TAsyncActionPayload) => {

	const func = getAction(payload.action);

	/*
	 * The TAsyncActionPayload type guarantees this call is safe.
	 * We cast to a generic function type to satisfy TypeScript's inference limitations.
	 */
	return (func as (...args: any[])=> Promise<unknown>)(...payload.args);

};

export const syncActionKeys = new Set<string>(Object
	.keys(actions)
	.filter((key) => actions[key as TActionType].constructor.name !== 'AsyncFunction'));
