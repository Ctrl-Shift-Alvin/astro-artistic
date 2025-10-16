import rss from '@astrojs/rss';

import { type APIContext } from 'astro';
import { GlobalTranslation } from '@/locales/global';
import { events_getAllEntries } from '@/backend/database/events';

export async function GET(context: APIContext) {

	const items = events_getAllEntries().map(
		(item) => {

			return {
				title: item.title,
				description: 'Location: ' + item.location,
				link: `${context.site?.href ?? import.meta.env.SITE}events/`,
				pubDate: new Date()
			};

		}
	);

	const rssResponse = await rss({
		title: `${GlobalTranslation.author}'s Events`,
		description: `${GlobalTranslation.author} event schedule.`,
		site: context.site?.href ?? import.meta.env.SITE,
		items: items,
		stylesheet: 'style.xsl',
		customData: '<language>en-gb</language>'
	});

	// Read rss body
	const rssText = await rssResponse.text();

	// Apply a few fixes for best rss practice
	const modifiedRss = rssText.replace(
		'<rss version="2.0">',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">'
	).replace(
		'<channel>',
		`<channel><atom:link href="${context.url}" rel="self" type="application/rss+xml" />`
	);

	return new Response(
		modifiedRss,
		{
			status: 200,
			headers: { 'Content-Type': 'application/xml' }
		}
	);

}
