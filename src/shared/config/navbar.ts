import { ZNavbarConfig } from './configTypes';
import { type TTranslation } from '@/locales/global';

export const NavbarConfig = (translation: TTranslation) => ZNavbarConfig.parse({
	items: [
		{
			name: translation.navbar.homepage,
			href: '/'
		},
		{
			name: translation.navbar.events,
			href: '/events/'
		},
		{
			name: translation.navbar.others,
			href: '/others/'
		},
		{
			name: translation.navbar.blog,
			href: '/blog/'
		},
		{
			name: translation.navbar.contact,
			href: '/contact/'
		}
	]
});
