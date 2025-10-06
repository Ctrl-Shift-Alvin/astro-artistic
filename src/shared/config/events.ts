import { ZEventsConfig } from './configTypes';

export const EventsConfig = ZEventsConfig.parse({
	showLinks: true,
	ageRangeShown: {
		minDays: -14,
		maxDays: Number.MAX_SAFE_INTEGER
	}
});
