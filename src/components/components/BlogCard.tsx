import {
	type IBlogMarkdownInstance, type IBlogFrontmatter
} from '../types';
import { A } from '../elements/A';
import { defaultFormatDateString } from '@/shared/dataParse';

export const BlogCard = ({ blogFile }: { blogFile: IBlogMarkdownInstance<IBlogFrontmatter> }) => (
	<A
		className={'hover:translate-y-1'}
		href={blogFile.url}
	>
		<div className={'overflow-hidden rounded-md bg-gray-800'}>
			<div className={'aspect-2/2'}>
				<img
					className={'size-full object-cover object-center'}
					src={blogFile.frontmatter.imgSrc}
					alt={blogFile.frontmatter.imgAlt}
					loading={'lazy'}
				/>
			</div>

			<div className={'px-3 pt-4 pb-6 text-center'}>
				<h2 className={'text-xl font-semibold'}>
					{blogFile.frontmatter.title}
				</h2>

				<div className={'mt-1 text-xs text-gray-400'}>
					{defaultFormatDateString(new Date(blogFile.frontmatter.pubDate))}
				</div>

				<div className={'mt-2 text-sm'}>
					{blogFile.frontmatter.description}
				</div>
			</div>
		</div>
	</A>
);
