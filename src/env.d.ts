/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { ITranslation } from '@/locales/global';
import type { MonologEmitter } from '@/components/components/MonologProvider';
import type { DialogEmitter } from './components/components/DialogProvider';

declare global {

	declare namespace App {
		interface Locals {
			translation: ITranslation;
		}
	}

	interface Window {
		__TRANSLATION__: ITranslation;
		monologEmitter: MonologEmitter | undefined;
		dialogEmitter: DialogEmitter | undefined;
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