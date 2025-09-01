/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { ITranslation } from './locales/global';

declare global {

	declare namespace App {
		interface Locals {
			translation: ITranslation;
		}
	}

	interface Window {
		__TRANSLATION__: ITranslation;
	}
}