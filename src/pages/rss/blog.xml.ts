import rss from '@astrojs/rss';
import { type APIContext } from 'astro';
import { GlobalTranslation } from '@/locales/global';
import { getAllBlogs } from '@/backend/blogs';

export async function GET(context: APIContext) {

	const items = getAllBlogs().map((item) => {

		return {
			title: item.frontmatter.title,
			description: item.frontmatter.description,
			link: `${context.site?.href || import.meta.env.SITE}blog/`,
			pubDate: new Date(item.frontmatter.pubDate)
		};

	});

	const rssResponse = await rss({
		title: `${GlobalTranslation.author}'s Blog`,
		description: `${GlobalTranslation.author} blog posts.`,
		site: context.site?.href || import.meta.env.SITE as string,
		items: items,
		stylesheet: 'style.xsl',
		customData: '<language>en-gb</language>'
	});

	// Read rss body
	const rssBody = await rssResponse.text();

	// Apply a few fixes for best rss practice
	const modifiedBody = rssBody
		.replace(
			'<rss version="2.0">',
			'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">'
		)
		.replace(
			'<channel>',
			`<channel><atom:link href="${context.url}" rel="self" type="application/rss+xml" />`
		);

	return new Response(
		modifiedBody,
		{
			status: 200,
			headers: { 'Content-Type': 'application/xml' }
		}
	);

}
