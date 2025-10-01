import { ZBlogConfig } from './configTypes';

export const BlogConfig = ZBlogConfig.parse({
	pageSize: 6,
	maxRecentCardCount: 3,
	tableInitialEntryCount: 5
});
