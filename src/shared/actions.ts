import { windowRefresh } from '@/frontend/windowTools';
import { cSetIgnoreSizeError } from '@/shared/cookies';

const actions = {
	sizeErrorIgnore: () => {

		cSetIgnoreSizeError(true);
		windowRefresh();

	}
} as const;

export type TAction = keyof typeof actions;

export const getAction = (actionName: TAction): ()=> void => {

	return actions[actionName];

};
