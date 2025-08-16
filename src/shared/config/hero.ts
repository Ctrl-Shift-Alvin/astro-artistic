import { ZHeroConfig } from './configTypes';
import { type ITranslation } from '@/locales/global';

export const HeroConfig = (translation: ITranslation) => ZHeroConfig.parse({

	title: translation.heroAvatar.title,
	description: translation.heroAvatar.description,
	avatarImageSource: '/images/piano-hands.png',
	heroSocialButtons: [
		{
			href: 'youtube.com/',
			imageSource: '/images/youtube-icon.png',
			imageAlt: 'Youtube Icon'
		},
		{
			href: 'youtube.com/home',
			imageSource: '/images/youtube-icon.png',
			imageAlt: 'Youtube Icon'
		},
		{
			href: 'youtube.com/#',
			imageSource: '/images/youtube-icon.png',
			imageAlt: 'Youtube Icon'
		}
	]

});
