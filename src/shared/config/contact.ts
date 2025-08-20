import { ZContactConfig } from './configTypes';

export const ContactConfig = ZContactConfig.parse({
	contacts: {
		default: {
			description: '',
			email: 'maxwellmaxmaxunwell@maxmail.com',
			telNumber: '+1 8888 88 888',
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
