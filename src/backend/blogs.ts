import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import matter from 'gray-matter';
import {
	type TBlogMarkdownInstance,
	ZBlogFrontmatter
} from '@/components/types';
import { BlogConfig } from '@/backend/config/blog';

/**
 * Get the URL pathname of the blog posts, based on `BlogConfig.pagesPath`.
 * @returns The URL pathname of the blog posts page.
 */
export function getBlogUrlPathname(): string {

	try {

		return BlogConfig
			.pagesPath
			.split(/src[/\\]pages/)[0]!
			.replace(
				/\\/g,
				'/'
			) + '/';

	} catch(err: any) {

		console.error(
			'Failed to parse blog URL pathname:\n ',
			err
		);
		return '/blog/';

	}

}

/**
 * Get all blogs (.md files) in the blogs directory.
 */
export function getAllBlogs(): TBlogMarkdownInstance[] {

	try {

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

			const parsedFrontmatter = ZBlogFrontmatter.safeParse(frontmatter);
			if (!parsedFrontmatter.success) {

				throw new Error(`Failed to parse frontmatter of '${file}'!`);

			}

			posts.push({
				url: `${getBlogUrlPathname()}${file.replace(
					/\.md$/,
					''
				)}/`,
				fileName: file,
				frontmatter: parsedFrontmatter.data,
				content
			});

		}
		return posts;

	} catch(err: any) {

		console.error(
			'Failed to get all blog instances:\n ',
			err
		);
		return [];

	}

}

/**
 * Get a single blog post instance by its file name in the directory.
 *
 * @returns The blog post instance if the file exists. Otherwise, `null`.
 */
export function getBlog(fileName: string): TBlogMarkdownInstance | null {

	try {

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

			const parsedFrontmatter = ZBlogFrontmatter.safeParse(parsed.data);
			if (!parsedFrontmatter.success) {

				throw new Error(`Failed to parse frontmatter of '${file}'!`);

			}

			return {
				url: `${getBlogUrlPathname()}${file.replace(
					/\.md$/,
					''
				)}/`,
				fileName: file,
				frontmatter: parsedFrontmatter.data,
				content: parsed.content
			};

		}
		return null;

	} catch(err: any) {

		console.error(
			`Failed to get blog instance with file name '${fileName}':\n `,
			err
		);
		return null;

	}

}

/**
 * Get all blogs sorted by their publication date in descending order.
 */
export function getSortedBlogs() {

	const posts = getAllBlogs();
	posts.sort(
		(
			a,
			b
		) => new Date(b.frontmatter.pubDate).valueOf()
			- new Date(a.frontmatter.pubDate).valueOf()
	);
	return posts;

}

/**
 * Get all blogs sorted by their publication date in descending order, sliced by a start and end value.
 */
export function getSortedBlogsSliced(
	start?: number,
	end?: number
) {

	const sortedPosts = getSortedBlogs();
	return sortedPosts.slice(
		start,
		end
	);

}

/**
 * Create a new blog post page using a file name.
 *
 * @param fileName The file name to use when creating the new post page.
 * @returns `true` if the page was created successfully. Otherwise, `false`.
 */
export const blog_createPage = async(fileName: string): Promise<boolean> => {

	try {

		if (!fs.existsSync(BlogConfig.pagesPath)) {

			fs.mkdirSync(
				BlogConfig.pagesPath,
				{ recursive: true }
			);

		}

		const existingFiles = fs.readdirSync(
			BlogConfig.pagesPath,
			{ withFileTypes: true }
		);

		if (existingFiles.map((e) => e.name).find((e) => e === `${fileName}.md`)
		) {

			return false;

		}

		await new Promise(
			(
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

			}
		);
		return true;

	} catch {

		return false;

	}

};

/**
 * Count the existing blog posts (files).
 */
export const blog_countEntries = (): number => {

	try {

		return fs.existsSync(BlogConfig.pagesPath)
			? fs
				.readdirSync(
					BlogConfig.pagesPath,
					{
						recursive: false,
						withFileTypes: true
					}
				)
				.filter((e) => e.isFile() && e.name.endsWith('.md'))
				.length
			: 0;

	} catch(err: any) {

		console.error(
			'Failed to count blog entries:\n ',
			err
		);
		return 0;

	}

};
