import { ZContactConfig } from './configTypes';
import { GlobalTranslation } from '@/locales/global';

export const ContactConfig = ZContactConfig.parse({
	contacts: {
		default: {
			description: '',
			email: GlobalTranslation.email,
			telNumber: GlobalTranslation.telNumber,
			defaultNumberCode: '43'
		}

		/*
		 * // Add more contacts here, and pass them to the 'ContactCard' component's 'contactData' prop
		 * Person1: {
		 * 	email: 'xxx@x.xxx',
		 * 	...
		 * }
		 */
	}

});
