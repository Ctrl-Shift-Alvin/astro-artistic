import { ZHeroConfig } from './configTypes';
import { type ITranslation } from '@/locales/global';

export const HeroConfig = (translation: ITranslation) => ZHeroConfig.parse({

	title: translation.heroAvatar.title,
	description: translation.heroAvatar.description,
	avatarImageSource: '/images/piano-hands.png',
	heroSocialButtons: [
		{
			href: 'https://youtube.com/',
			imageSource: '/images/youtube-icon.png',
			imageAlt: 'Youtube Icon'
		},
		{
			href: 'https://twitter.com/', // Shut up
			imageSource: '/images/twitter-icon.png',
			imageAlt: 'Youtube Icon'
		},
		{
			href: 'https://facebook.com/',
			imageSource: '/images/facebook-icon.png',
			imageAlt: 'Youtube Icon'
		}
	]

});
