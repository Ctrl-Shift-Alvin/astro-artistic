import {
	useState,
	useLayoutEffect,
	useCallback
} from 'react';
import clsx from 'clsx/lite';
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
import { TrashcanIcon } from '@/components/components/icons/TrashcanIcon';

/**
 * A table for an overview of all events, and a way to access each of them, that works through the protected admin API.
 */
export const AdminEventTable = () => {

	const [
		eventEntries,
		setEventEntries
	] = useState<TEventEntry[]>([]);

	const remove = useCallback(
		async(id: string | number) => {

			await deleteEvent(id);
			const result = await fetchEventIndex();
			if (result) {

				setEventEntries(result);

			}

		},
		[]
	);

	useLayoutEffect(
		() => {

			const loadData = async() => {

				const result = await fetchEventIndex();
				if (result)
					setEventEntries(result);

			};

			void loadData();

		},
		[]
	);

	const tdClassName = clsx('border p-2');
	const headTdClassName = clsx('border p-2 font-bold');

	return (
		<>
			<table className={'w-4/6 border-collapse border border-gray-300'}>
				<thead>
					<tr>
						<td className={headTdClassName}>
							{'ID'}
						</td>

						<td className={headTdClassName}>
							{'Title'}
						</td>

						<td className={headTdClassName}>
							{'Location'}
						</td>

						<td className={headTdClassName}>
							{'Date & Time'}
						</td>

						<td className={headTdClassName}>
							{'Page'}
						</td>

						<td />
					</tr>
				</thead>

				<tbody>
					{
						eventEntries.sort(
							(
								a,
								b
							) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
						).map(
							(entry) => {

								return (
									<tr key={entry.id}>

										<td className={tdClassName}>
											<A
												className={'underline'}
												href={`/admin/events/${entry.id}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}
											>
												{entry.id}
											</A>
										</td>

										<td className={tdClassName}>
											{entry.title}
										</td>

										<td className={tdClassName}>
											{entry.location}
										</td>

										<td className={tdClassName}>
											{
												Intl.DateTimeFormat(
													cGetUserLanguage() ?? defaultLanguageCode,
													{
														year: 'numeric',
														month: 'numeric',
														day: 'numeric',
														hour: 'numeric',
														minute: 'numeric'
													}
												).format(new Date(entry.dateTime))
											}
										</td>

										<td className={tdClassName}>
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

										<td
											className={
												clsx(
													tdClassName,
													'w-px'
												)
											}
										>
											<TrashcanIcon onClick={() => void remove(entry.id)} />
										</td>
									</tr>
								);

							}
						)
					}
				</tbody>
			</table>

			<div className={'flex w-full mt-2 flex-row justify-evenly'}>
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
