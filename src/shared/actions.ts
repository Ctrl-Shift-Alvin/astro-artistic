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

export type TAction = keyof typeof actions;

export const getAction = (actionName: TAction): ()=> void => {

	return actions[actionName];

};
