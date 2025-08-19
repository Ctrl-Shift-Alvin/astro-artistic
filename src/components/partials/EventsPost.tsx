import { type ReactNode } from 'react';
import { defaultFormatDateTimeString } from '@/shared/dataParse';
import { TEventsEntry } from '@/components/types';

export const EventsPost = ({
	eventEntry,
	children
}: {
	eventEntry: TEventsEntry;
	children: ReactNode;
}) => {

	return (
		<>
			<h1 className={'text-center text-3xl font-bold text-white'}>
				{eventEntry.title}
			</h1>

			<h2 className={'text-center text-xl text-white'}>
				{defaultFormatDateTimeString(new Date(eventEntry.dateTime))}
			</h2>

			<h2 className={'text-center text-xl text-white'}>
				{eventEntry.location}
			</h2>

			<div className={'prose prose-invert prose-img:rounded-lg mt-8'}>
				{children}
			</div>
		</>
	);

};
