/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { TTranslation } from '@/locales/global';
import type { MonologEmitter, TMonologOptions } from '@/components/components/MonologProvider';
import type { DialogEmitter, TDialogOptions } from './components/components/DialogProvider';
import type { Emitter, TBuild } from '@/components/types';

declare global {

	declare namespace App {
		interface Locals {
			translation: TTranslation;
		}
	}

	interface Window {
		__TRANSLATION__: TTranslation;
		__BUILD__: TBuild;
		monologEmitter: Emitter<TMonologOptions> | undefined;
		dialogEmitter: Emitter<TDialogOptions> | undefined;

		removeLoader?: ()=> void;
		loaderRemoved?: boolean;
	}

	interface String {
		/**
		 * Removes the first occurrence of a substring from the string.
		 * @param {string} substring The substring to remove.
		 * @returns {string} The string with the first occurrence of the substring removed.
		 */
		without(substring: string): string;

		/**
		 * Removes all occurrences of a substring from the string.
		 * @param {string} substring The substring to remove.
		 * @returns {string} The string with all occurrences of the substring removed.
		 */
		withoutAll(substring: string): string;

		/**
		 * Capitalizes the first letter of the string.
		 * @returns {string} The string with the first letter capitalized.
		 */
		capitalize(): string;
	}
}