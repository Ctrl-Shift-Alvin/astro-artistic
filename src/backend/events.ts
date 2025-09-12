import path from 'node:path';
import fs from 'node:fs';
import matter from 'gray-matter';
import {
	type IEventFrontmatter,
	type IEventMarkdownInstance
} from '@/components/types';
import { EventsConfig } from '@/backend/config/events';

export function events_getEventContent(id: string): IEventMarkdownInstance<IEventFrontmatter> | null {

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

}
