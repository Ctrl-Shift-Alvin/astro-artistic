import { cSetIgnoreSizeError } from '@/shared/cookies';

const actions: Record<string, ()=> void> = {
	sizeErrorIgnore: () => {

		cSetIgnoreSizeError(true);

	}
};

export const getAction = (actionName: string): (()=> void) | undefined => {

	return actions[actionName];

};
