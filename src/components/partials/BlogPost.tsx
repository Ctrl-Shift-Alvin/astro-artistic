import { type ReactNode } from 'react';
import { type IBlogFrontmatter } from '@/components/types';
import { GlobalTranslation } from '@/locales/global';
import { defaultFormatDateString } from '@/shared/dataParse';

export const BlogPost = ({
	blogHeader,
	children
}: {
	blogHeader: IBlogFrontmatter;
	children: ReactNode;
}) => (
	<>
		<h1 className={'text-center text-3xl font-bold text-white'}>
			{blogHeader.title}
		</h1>

		<div className={'mt-2 text-center text-sm text-white'}>
			{'By'}
			{' '}
			{GlobalTranslation.author}
			{' '}
			{'on'}
			{' '}
			{defaultFormatDateString(new Date(blogHeader.pubDate))}
		</div>

		<div className={'mx-auto mt-5 max-w-prose'}>
			<div className={'aspect-h-2 aspect-w-3'}>
				<img
					className={'size-full rounded-lg object-cover object-center'}
					src={blogHeader.imgSrc}
					alt={blogHeader.imgAlt}
					loading={'lazy'}
				/>
			</div>

			<div className={'prose prose-invert prose-img:rounded-lg mt-8'}>
				{children}
			</div>
		</div>
	</>
);
