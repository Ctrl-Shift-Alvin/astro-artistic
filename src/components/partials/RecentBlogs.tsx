import { useMemo } from 'react';
import { BlogGallery } from '@/components/partials/BlogGallery';
import { A } from '@/components/elements/A';
import { type TBlogMarkdownInstance } from '@/components/types';
import { BlogConfig } from '@/shared/config/blog';

export const RecentBlogs = ({ recentBlogFiles }: { recentBlogFiles: TBlogMarkdownInstance[] }) => {

	const config = useMemo(
		() => BlogConfig(window.__TRANSLATION__),
		[]
	);

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
