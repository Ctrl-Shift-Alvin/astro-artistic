import {
	useState,
	useLayoutEffect,
	useCallback
} from 'react';
import { A } from '@/components/elements/A';
import { Button } from '@/components/elements/Button';
import { type TEventEntry } from '@/components/types';
import {
	fetchEventIndex,
	deleteEvent,
	getPrevUrlQuery
} from '@/frontend/adminApi';
import { cGetUserLanguage } from '@/shared/cookies';
import { defaultLanguageCode } from '@/backend/i18n';

export const AdminEventTable = () => {

	const [
		eventEntries,
		setEventEntries
	] = useState<TEventEntry[]>([]);

	const index = useCallback(
		async() => {

			const result = await fetchEventIndex();
			if (result) {

				setEventEntries(result);

			}

		},
		[]
	);
	const remove = useCallback(
		async(id: string | number) => {

			await deleteEvent(id);
			void index();

		},
		[ index ]
	);

	useLayoutEffect(
		() => void index(),
		[ index ]
	);

	return (
		<>
			<table className={'w-4/6 border-collapse border border-gray-300'}>
				<thead>
					<tr>
						<td className={'w-1/12 border p-2 font-bold'}>
							{'ID'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Title'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Location'}
						</td>

						<td className={'w-1/6 border p-2 font-bold'}>
							{'Date & Time'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Page'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'D'}
						</td>
					</tr>
				</thead>

				<tbody>
					{
						eventEntries
							.sort((
								a,
								b
							) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
							.map((entry) => (
								<tr key={entry.id}>

									<td className={'border p-2'}>
										<A
											className={'underline'}
											href={`/admin/events/${entry.id}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}
										>
											{entry.id}
										</A>
									</td>

									<td className={'border p-2'}>
										{entry.title}
									</td>

									<td className={'border p-2'}>
										{entry.location}
									</td>

									<td className={'border p-2'}>
										{
											Intl
												.DateTimeFormat(
													cGetUserLanguage() ?? defaultLanguageCode,
													{
														year: 'numeric',
														month: 'numeric',
														day: 'numeric',
														hour: 'numeric',
														minute: 'numeric'
													}
												)
												.format(new Date(entry.dateTime))
										}
									</td>

									<td className={'border p-2'}>
										{
											entry.enablePage
												?	(
													<A
														className={'underline'}
														href={`/events/${entry.id}/`}
													>
														{'Yes'}
													</A>
												)
												: (
													<p>
														{'No'}
													</p>
												)
										}
									</td>

									<td className={'border p-2'}>
										<A
											className={'text-red-600'}
											onClick={() => void remove(entry.id)}
										>
											{'D'}
										</A>
									</td>
								</tr>
							))
					}
				</tbody>
			</table>

			<div className={'flex w-full flex-row justify-evenly'}>
				<Button
					small={true}
					href={`/admin/events/new/${getPrevUrlQuery()}`}
				>
					{'Add'}
				</Button>
			</div>
		</>
	);

};
