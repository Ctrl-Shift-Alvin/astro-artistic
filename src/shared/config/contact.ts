import { ZContactConfig } from './configTypes';
import {
	GlobalTranslation, type ITranslation
} from '@/locales/global';

export const ContactConfig = ZContactConfig.parse({
	contacts: {
		default: {
			contact: (translation: ITranslation) => ({
				title: translation.contact.title,
				description: translation.contact.formDescription,
				email: GlobalTranslation.email,
				telNumber: GlobalTranslation.telNumber,
				defaultNumberCode: '43'
			})

		}

		/*
		 * // Add more contacts here, and pass them to the 'ContactCard' component's 'contactData' prop
		 * Person1: {
		 * 	contact: (translation: ITranslation) => ({
		 * 		title: '',
		 * 		...
		 * })
		 */
	}

});
