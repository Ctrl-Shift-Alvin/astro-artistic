import path from 'node:path';
import fs from 'node:fs';
import matter from 'gray-matter';
import {
	type IEventFrontmatter,
	type IEventMarkdownInstance
} from '@/components/types';
import { EventsConfig } from '@/backend/config/events';

/**
 * Get a single blog post instance by its ID in the events database.
 *
 * @returns The blog post instance if the file exists. Otherwise, `null`.
 */
export function events_getEventContent(id: string): IEventMarkdownInstance<IEventFrontmatter> | null {

	try {

		const { pagesPath: EVENTS_PATH } = EventsConfig;

		const fileName = `${id}.md`;
		const fullPath = path.join(
			EVENTS_PATH,
			fileName
		);
		const raw = fs.readFileSync(fullPath);

		if (!fs.existsSync(fullPath))
			return null;

		const {
			data,
			content
		} = matter(raw);

		return {
			url: `/events/${id}/`,
			frontmatter: data as IEventFrontmatter,
			content
		};

	} catch(err: any) {

		console.error(
			`Failed to get event page content of event ID '${id}':\n `,
			err
		);
		return null;

	}

}
