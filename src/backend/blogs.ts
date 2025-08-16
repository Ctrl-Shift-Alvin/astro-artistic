import path from 'node:path';
import fs from 'node:fs';
import matter from 'gray-matter';
import {
	type IBlogMarkdownInstance, type IBlogFrontmatter
} from '@/components/types';
import { BlogConfig } from '@/backend/config/blog';

export function getAllBlogs(): IBlogMarkdownInstance<IBlogFrontmatter>[] {

	const pagesRoot = path.join(
		process.cwd(),
		'src',
		'pages'
	);
	const blogUrlPath = BlogConfig.pagesPath
		.substring(pagesRoot.length)
		.replace(
			/\\/g,
			'/'
		);

	const files = fs.readdirSync(BlogConfig.pagesPath);
	const posts: IBlogMarkdownInstance<IBlogFrontmatter>[] = [];

	for (const file of files) {

		if (!file.endsWith('.md'))
			continue;

		const fullPath = path.join(
			BlogConfig.pagesPath,
			file
		);
		const raw = fs.readFileSync(fullPath);
		const {
			data: frontmatter,
			content
		} = matter(raw);

		posts.push({
			url: `${blogUrlPath}/${file.replace(
				/\.md$/,
				''
			)}/`,
			frontmatter: frontmatter as IBlogFrontmatter,
			content
		});

	}
	return posts;

}

export function getBlog(fileName: string): IBlogMarkdownInstance<IBlogFrontmatter> | null {

	const blogsRoot = path.join(
		process.cwd(),
		'src',
		'pages'
	);
	const blogUrlPath = BlogConfig.pagesPath
		.substring(blogsRoot.length)
		.replace(
			/\\/g,
			'/'
		);

	const files = fs.readdirSync(BlogConfig.pagesPath);
	for (const file of files) {

		if (file === fileName)
			continue;

		const fullPath = path.join(
			BlogConfig.pagesPath,
			file
		);
		const raw = fs.readFileSync(fullPath);
		const parsed = matter(raw);

		return {
			url: `${blogUrlPath}/${file.replace(
				/\.md$/,
				''
			)}/`,
			frontmatter: parsed.data as IBlogFrontmatter,
			content: parsed.content
		};

	}
	return null;

}

export function getSortedBlogs() {

	const posts = getAllBlogs();
	posts.sort((
		a,
		b
	) => new Date(b.frontmatter.pubDate).valueOf()
		- new Date(a.frontmatter.pubDate).valueOf());
	return posts;

}

export function getSortedBlogsSliced(
	start: number,
	end: number
) {

	const sortedPosts = getSortedBlogs();
	return sortedPosts.slice(
		start,
		end
	);

}
