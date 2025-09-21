import {
	useCallback,
	useLayoutEffect,
	useState
} from 'react';
import clsx from 'clsx';
import { A } from '@/components/elements/A';
import { type TContactFormEntry } from '@/components/types';
import {
	fetchContactEntryIndex,
	deleteContactEntry,
	countContactEntries
} from '@/frontend/adminApi';
import { ContactConfig } from '@/shared/config/contact';

export const AdminContactTable = () => {

	const [
		contactEntryIndex,
		setContactEntryIndex
	] = useState<TContactFormEntry[]>([]);

	const [
		fullIndexCount,
		setFullIndexCount
	] = useState(0);

	const [
		contactEntryCount,
		setContactEntryCount
	] = useState(ContactConfig.tableInitialEntryCount);

	const index = useCallback(
		async(count: number) => {

			/*
			 * Because of semi-circular deps, when 'Show more...' is clicked, this is called twice.
			 * A simple check if something has changed prevents an API request.
			 */
			if (count == contactEntryIndex.length)
				return;

			// If count decreased, just slice the errors index
			if (contactEntryIndex.length >= count) {

				setContactEntryIndex((prev) => prev.slice(
					0,
					count
				));
				return;

			}

			// Otherwise, fetch only missing rows
			const result = await fetchContactEntryIndex(
				count - contactEntryIndex.length,
				contactEntryIndex.length
			);

			if (result == null)
				return;

			setContactEntryIndex((prev) => [
				...prev,
				...result
			].slice(
				0,
				contactEntryCount
			));

		},
		[
			contactEntryCount,
			contactEntryIndex.length
		]
	);

	const count = useCallback(
		async() => {

			const result = await countContactEntries();
			if (result === null)
				return;

			setFullIndexCount(result);

		},
		[]
	);

	const del = useCallback(
		async(id: number) => {

			await deleteContactEntry(id);
			setContactEntryIndex([]); // Refetch all errors, but keep the shown count
			void index(contactEntryCount);

		},
		[
			contactEntryCount,
			index
		]
	);

	const increaseCount = useCallback(
		() => {

			setContactEntryCount((prev) => prev + ContactConfig.tableInitialEntryCount);

		},
		[]
	);

	const decreaseCount = useCallback(
		() => {

			setContactEntryCount((prev) => prev - ContactConfig.tableInitialEntryCount);

		},
		[]
	);

	useLayoutEffect(
		() => {

			void count();
			void index(contactEntryCount);

		},
		[
			contactEntryCount,
			index,
			count
		]
	);

	return (
		<>
			<table className={'w-4/6 border-collapse border border-gray-300'}>
				<thead>
					<tr>
						<td className={'border p-2 font-bold'}>
							{'ID'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'First Name'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Last Name'}
						</td>

						<td className={'w-4/7 border p-2 font-bold'}>
							{'Message'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'D'}
						</td>
					</tr>
				</thead>

				<tbody>
					{
						contactEntryIndex.map((entry) => {

							const tdClassName = clsx('border p-2');
							return (
								<tr key={entry.id}>

									<td className={tdClassName}>
										<A
											href={`/admin/submission/contact/${entry.id}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}
											className={'underline'}
										>
											{entry.id}
										</A>
									</td>

									<td className={tdClassName}>
										{entry.firstName}
									</td>

									<td className={tdClassName}>
										{entry.lastName}
									</td>

									<td
										className={
											clsx(
												tdClassName,
												'max-w-44 truncate overflow-ellipsis'
											)
										}
									>
										{entry.message}
									</td>

									<td className={tdClassName}>
										<A
											className={'text-red-600'}
											onClick={() => void del(entry.id)}
										>
											{'D'}
										</A>
									</td>
								</tr>
							);

						})
					}
				</tbody>
			</table>

			{
				contactEntryCount >= ContactConfig.tableInitialEntryCount * 2
				&& (
					<A
						onClick={
							() => {

								decreaseCount();

							}
						}
					>
						{'Show less...'}
					</A>
				)
			}

			{
				fullIndexCount > contactEntryCount
				&& (
					<A
						onClick={
							() => {

								increaseCount();

							}
						}
					>
						{'Show more...'}
					</A>
				)
			}

		</>
	);

};
