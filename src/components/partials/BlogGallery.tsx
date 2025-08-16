import {
	useEffect, useState
} from 'react';
import { BlogCard } from '../components/BlogCard';
import {
	type IBlogFrontmatter, type IBlogMarkdownInstance
} from '@/components/types';

export const BlogGallery = ({
	blogFileList,
	cutRemainder = true,
	className
}: {
	blogFileList: IBlogMarkdownInstance<IBlogFrontmatter>[];
	cutRemainder?: boolean;
	className?: string;
}) => {

	const initialLength = blogFileList.length;

	const [
		blogFileListProcessed,
		setBlogFileListProcessed
	]
		= useState<IBlogMarkdownInstance<IBlogFrontmatter>[]>(blogFileList);
	useEffect(
		() => {

			const remainderTwo = initialLength % 2;
			const remainderThree = initialLength % 3;
			if (remainderTwo === 0 && (remainderThree === 0 || !cutRemainder))
				return;

			const update = () => {

				// Between sm and md viewports
				if (640 <= window.innerWidth && window.innerWidth < 768) {

					setBlogFileListProcessed(blogFileList.slice(
						0,
						blogFileList.length - remainderTwo
					));

				} else if (window.innerWidth >= 768) {

					setBlogFileListProcessed(blogFileList.slice(
						0,
						blogFileList.length - remainderThree
					));

				} else {

					setBlogFileListProcessed(blogFileList);

				}

			};
			window.addEventListener(
				'resize',
				update
			);

			update();

		},
		[]
	);

	return (
		<div
			className={`grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 ${className}`}
		>
			{blogFileListProcessed.map((instance) => (
				<BlogCard
					key={instance.url}
					blogFile={instance}
				/>
			))}
		</div>
	);

};
