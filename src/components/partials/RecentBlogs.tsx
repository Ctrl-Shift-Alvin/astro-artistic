import { A } from '../components/A';
import { BlogGallery } from './BlogGallery';
import {
	type IBlogFrontmatter, type IBlogMarkdownInstance
} from '@/components/types';
import { BlogConfig } from '@/shared/config/blog';

export const RecentBlogs = ({ recentBlogFiles }: { recentBlogFiles: IBlogMarkdownInstance<IBlogFrontmatter>[] }) => {

	const config = BlogConfig(window.__TRANSLATION__);

	if (recentBlogFiles.length < 1)
		return null;

	return (
		<>
			<div className={'my-5 w-full text-right'}>
				<A
					href={'/blog/'}
					className={'text-lg'}
				>
					{config.recentBlogsCard.gotoBlogButton}
					{' '}
					{'→'}
				</A>
			</div>

			<BlogGallery blogFileList={recentBlogFiles} />
		</>
	);

};
