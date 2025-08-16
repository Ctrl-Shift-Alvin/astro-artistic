import path from 'node:path';
import { ZBlogConfig } from './configTypes';

export const BlogConfig = ZBlogConfig.parse({
	pagesPath: path.join(
		process.cwd(),
		'src',
		'pages',
		'blog'
	)
});
