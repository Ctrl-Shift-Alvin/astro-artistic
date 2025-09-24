import path from 'node:path';
import fs, { readdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import matter from 'gray-matter';
import {
	type TBlogMarkdownInstance,
	type TBlogFrontmatter
} from '@/components/types';
import { BlogConfig } from '@/backend/config/blog';

export function getBlogUrlPathname(): string {

	return BlogConfig.pagesPath
		.split(/src[/\\]pages/)[1]!
		// eslint-disable-next-line custom/newline-per-chained-call
		.replace(
			/\\/g,
			'/'
		) + '/';

}

export function getAllBlogs(): TBlogMarkdownInstance[] {

	const files = fs.readdirSync(BlogConfig.pagesPath);
	const posts: TBlogMarkdownInstance[] = [];

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
			url: `${getBlogUrlPathname()}${file.replace(
				/\.md$/,
				''
			)}/`,
			fileName: file,
			frontmatter: frontmatter as TBlogFrontmatter,
			content
		});

	}
	return posts;

}
export function getBlog(fileName: string): TBlogMarkdownInstance | null {

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
			url: `${getBlogUrlPathname()}${file.replace(
				/\.md$/,
				''
			)}/`,
			fileName: file,
			frontmatter: parsed.data as TBlogFrontmatter,
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
export const blog_countEntries = (): number => {

	return fs.existsSync(BlogConfig.pagesPath)
		? fs.readdirSync(
			BlogConfig.pagesPath,
			{
				recursive: false,
				withFileTypes: true
			}
		).filter((e) => e.isFile() && e.name.endsWith('.md')).length
		: 0;

};
export const blog_getEntries = (
	count: number,
	offset: number = 0
): string[] => {

	const files = readdirSync(
		BlogConfig.pagesPath,
		{
			recursive: false,
			withFileTypes: true
		}
	);
	return files
		.filter((e) => e.isFile() && e.name.endsWith('.md'))
		.slice(
			offset,
			offset + count
		)
		.map((e) => e.name);

};
