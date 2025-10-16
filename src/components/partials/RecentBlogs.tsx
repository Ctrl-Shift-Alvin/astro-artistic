import { BlogGallery } from '@/components/partials/BlogGallery';
import { A } from '@/components/elements/A';
import { type TBlogMarkdownInstance } from '@/components/types';

/**
 * A blog post gallery consisting of multiple blog cards of the most recent blog posts.
 */
export const RecentBlogs = ({ recentBlogFiles }: { recentBlogFiles: TBlogMarkdownInstance[] }) => {

	return (
		<>
			<div className={'my-5 w-full text-right'}>
				<A
					href={'/blog/'}
					className={'text-lg'}
				>
					{window
						.__TRANSLATION__
						.blog
						.gotoBlogButton}

					{' '}
					{'→'}
				</A>
			</div>

			<BlogGallery blogFileList={recentBlogFiles} />
		</>
	);

};
