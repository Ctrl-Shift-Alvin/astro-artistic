/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { windowRefresh } from '@/frontend/windowTools';
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
// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
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

	// @ts-ignore When TAsyncActionPayload is 'never', 'payload.action' is an error.
	const func = getAction(payload.action);

	/*
	 * The TSyncActionPayload type guarantees this call is safe.
	 * We cast to a generic function type to satisfy TypeScript's inference limitations.
	 */
	// @ts-ignore When TAsyncActionPayload is 'never', 'payload.action' is an error.
	(func as (...args: any[])=> void)(...payload.args || []);

};

/**
 * Executes an asynchronous action from a payload object.
 * @param payload The asynchronous action payload.
 * @returns The promise returned by the async action.
 */
export const executeAsyncAction = (payload: TAsyncActionPayload) => {

	// @ts-ignore When TAsyncActionPayload is 'never', 'payload.action' is an error.
	const func = getAction(payload.action);

	/*
	 * The TAsyncActionPayload type guarantees this call is safe.
	 * We cast to a generic function type to satisfy TypeScript's inference limitations.
	 */
	// @ts-ignore When TAsyncActionPayload is 'never', 'payload.args' is an error.
	return (func as (...args: any[])=> Promise<unknown>)(...payload.args);

};

export const syncActionKeys = new Set<string>(Object
	.keys(actions)
	.filter((key) => actions[key as TActionType].constructor.name !== 'AsyncFunction'));
