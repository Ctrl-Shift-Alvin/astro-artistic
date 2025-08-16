import {
	ZBlogConfig, type TBlogConfig
} from './configTypes';
import { type ITranslation } from '@/locales/global';

export const BlogConfig = (translation: ITranslation): TBlogConfig => ZBlogConfig.parse({
	title: translation.blog.title,
	description: translation.blog.description,
	pageSize: 6, // Recommended to use a multiple of 3, though it's not enforced
	recentBlogsCard: {
		title: translation.blog.recentPosts,
		gotoBlogButton: translation.blog.gotoBlogButton,
		maxCardCount: 3
	}
});
