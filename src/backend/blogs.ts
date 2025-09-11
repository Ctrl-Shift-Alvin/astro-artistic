import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import matter from 'gray-matter';
import {
	type IBlogMarkdownInstance, type IBlogFrontmatter
} from '@/components/types';
import { BlogConfig } from '@/backend/config/blog';

export function getAllBlogs(): IBlogMarkdownInstance<IBlogFrontmatter>[] {

	const blogUrlPath = BlogConfig.pagesPath
		.split(/src[/\\]pages/)[1]!
		// eslint-disable-next-line custom/newline-per-chained-call
		.replace(
			/\\/g,
			'/'
		) + '/';

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
			url: `${blogUrlPath}${file.replace(
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

	const blogUrlPath = BlogConfig.pagesPath
		.split(/src[/\\]pages/)[1]!
		// eslint-disable-next-line custom/newline-per-chained-call
		.replace(
			/\\/g,
			'/'
		) + '/';

	const files = fs.readdirSync(BlogConfig.pagesPath);
	for (const file of files) {

		if (file !== fileName)
			continue;

		const fullPath = path.join(
			BlogConfig.pagesPath,
			file
		);
		const raw = fs.readFileSync(fullPath);
		const parsed = matter(raw);

		return {
			url: `${blogUrlPath}${file.replace(
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

export const blog_createPage = async(fileName: string): Promise<boolean> => {

	if (!fs.existsSync(BlogConfig.pagesPath))
		fs.mkdirSync(BlogConfig.pagesPath);

	const existingFiles = fs.readdirSync(
		BlogConfig.pagesPath,
		{ withFileTypes: true }
	);

	if (existingFiles
		.map((e) => e.name)
		.find((e) => e === `${fileName}.md`)
	) {

		return false;

	}

	try {

		await new Promise((
			resolve,
			reject
		) => {

			try {

				const child = spawn(
					'npm',
					[
						'run',
						'createPost',
						'--',
						fileName
					],
					{ shell: true }
				);

				child.on(
					'error',
					reject
				);

				child.on(
					'close',
					(code) => {

						resolve(code === 0);

					}
				);

			} catch(err: any) {

				// eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
				reject(err);

			}

		});
		return true;

	} catch {

		return false;

	}

};
