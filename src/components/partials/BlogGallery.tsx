import {
	useLayoutEffect,
	useMemo,
	useState
} from 'react';
import clsx from 'clsx/lite';
import { BlogCard } from '../components/BlogCard';
import { type TBlogMarkdownInstance } from '@/components/types';

export const BlogGallery = ({
	blogFileList,
	cutRemainder = true,
	className
}: {
	blogFileList: TBlogMarkdownInstance[];
	cutRemainder?: boolean;
	className?: string;
}) => {

	const [
		windowWidth,
		setWindowWidth
	] = useState(0);

	useLayoutEffect(
		() => {

			const update = () => {

				setWindowWidth(window.innerWidth);

			};
			window.addEventListener(
				'resize',
				update
			);
			update();

			return () => {

				window.removeEventListener(
					'resize',
					update
				);

			};

		},
		[]
	);

	const blogFileListProcessed = useMemo(
		() => {

			if (!cutRemainder || blogFileList.length === 1)
				return blogFileList;

			const initialLength = blogFileList.length;
			const remainderTwo = initialLength % 2;
			const remainderThree = initialLength % 3;

			if (remainderTwo === 0 && remainderThree === 0)
				return blogFileList;

			// Between sm and md viewports
			if (640 <= windowWidth && windowWidth < 768) {

				if (remainderTwo === 0)
					return blogFileList;
				return blogFileList.slice(
					0,
					initialLength - remainderTwo
				);

			} else if (windowWidth >= 768) {

				if (remainderThree === 0)
					return blogFileList;
				return blogFileList.slice(
					0,
					initialLength - remainderThree
				);

			}
			return blogFileList;

		},
		[
			blogFileList,
			cutRemainder,
			windowWidth
		]
	);

	return blogFileListProcessed.length > 0
		? (
			<div
				className={
					clsx(
						'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3',
						className
					)
				}
			>
				{
					blogFileListProcessed.map((instance) => (
						<BlogCard
							key={instance.url}
							blogFile={instance}
						/>
					))
				}
			</div>
		)
		: (
			<p className={'w-full text-center text-lg'}>
				{window.__TRANSLATION__.blog.noPosts}
			</p>
		);

};
