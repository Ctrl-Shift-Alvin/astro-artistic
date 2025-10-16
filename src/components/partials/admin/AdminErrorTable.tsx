import React, {
	useCallback,
	useLayoutEffect,
	useState
} from 'react';
import clsx from 'clsx/lite';
import { type TError } from '@/components/types';
import {
	fetchErrorIndex,
	deleteError,
	fetchErrorIndexByBuild,
	fetchErrorCount,
	fetchErrorCountByBuild,
	getPrevUrlQuery
} from '@/frontend/adminApi';
import { ErrorsConfig } from '@/shared/config/errors';
import { A } from '@/components/elements/A';
import { defaultFormatDateTimeString } from '@/shared/time';
import { TrashcanIcon } from '@/components/components/icons/TrashcanIcon';

/**
 * A table for an overview of all error submissions,
 * and a way to access each of them, that works through the protected admin API.
 */
export const AdminErrorTable = ({ buildNumber }: { buildNumber?: number }) => {

	const [
		errorsIndex,
		setErrorsIndex
	] = useState<TError[]>([]);

	const [
		fullIndexCount,
		setFullIndexCount
	] = useState(0);

	const [
		errorsCount,
		setErrorsCount
	] = useState(ErrorsConfig.tableInitialErrorCount);

	const [
		expandedRows,
		setExpandedRows
	] = useState<Record<number, boolean>>({});

	const index = useCallback(
		async(count: number) => {

			/*
			 * Because of semi-circular deps, when 'Show more...' is clicked, this is called twice.
			 * A simple check if something has changed prevents an API request.
			 */
			if (count == errorsIndex.length)
				return;

			// If count decreased, just slice the errors index
			if (errorsIndex.length >= count) {

				setErrorsIndex(
					(prev) => prev.slice(
						0,
						count
					)
				);
				return;

			}

			// Otherwise, fetch only missing rows
			const result = buildNumber
				? await fetchErrorIndexByBuild(
					buildNumber,
					count - errorsIndex.length,
					errorsIndex.length
				)
				: await fetchErrorIndex(
					count - errorsIndex.length,
					errorsIndex.length
				);

			if (result == null)
				return;

			setErrorsIndex(
				(prev) => [
					...prev,
					...result
				].slice(
					0,
					errorsCount
				)
			);

		},
		[
			buildNumber,
			errorsCount,
			errorsIndex.length
		]
	);

	const del = useCallback(
		async(id: number | string) => {

			await deleteError(id);

			// Refetch all errors by clearing the index, which will trigger the layout effect.
			setErrorsIndex([]);

		},
		[]
	);

	const increaseCount = useCallback(
		() => {

			setErrorsCount((prev) => prev + ErrorsConfig.tableInitialErrorCount);

		},
		[]
	);

	const decreaseCount = useCallback(
		() => {

			setErrorsCount((prev) => prev - ErrorsConfig.tableInitialErrorCount);

		},
		[]
	);

	useLayoutEffect(
		() => {

			const loadData = async() => {

				const result = buildNumber
					? await fetchErrorCountByBuild(buildNumber)
					: await fetchErrorCount();

				if (result !== null) {

					setFullIndexCount(result);

				}

				// Only fetch if the index is empty (initial load or after a delete)
				if (errorsIndex.length === 0) {

					await index(errorsCount);

				}

			};

			void loadData();

		},
		[
			buildNumber,
			errorsCount,
			errorsIndex.length,
			index
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
							{'Created At'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Build Number'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'URL'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Is Client'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Status'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Status Text'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Error Message'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Error Cause'}
						</td>

						<td className={'border p-2'} />

					</tr>
				</thead>

				<tbody>
					{
						errorsIndex.map(
							(entry) => {

								const isErrorExapanded = expandedRows[entry.id] ?? false;

								const toggleIsErrorExpanded = () => {

									setExpandedRows(
										(previous) => ({
											...previous,
											[entry.id]: !isErrorExapanded
										})
									);

								};

								const tdClassName = 'border p-2';
								return (
									<React.Fragment key={entry.id}>
										<tr>

											<td className={tdClassName}>
												<A
													className={'text-center underline'}
													href={`/admin/submission/error/${entry.id}/${getPrevUrlQuery()}`}
												>
													{entry.id}
												</A>

											</td>

											<td className={tdClassName}>
												{defaultFormatDateTimeString(new Date(entry.createdAt))}
											</td>

											<td className={tdClassName}>
												<A
													className={'underline'}
													href={`/admin/submission/build/${entry.buildNumber}/${getPrevUrlQuery()}}`}
												>
													{entry.buildNumber}
												</A>
											</td>

											<td className={tdClassName}>
												{entry.url}
											</td>

											<td className={tdClassName}>
												{
													entry.isClient
														? 'Yes'
														: 'No'
												}
											</td>

											<td className={tdClassName}>
												{entry.status ?? '-'}
											</td>

											<td className={tdClassName}>
												{entry.statusText ?? '-'}
											</td>

											<td className={tdClassName}>
												{entry.errorMessage ?? '-'}
											</td>

											<td className={tdClassName}>
												{entry.errorCause ?? '-'}
											</td>

											<td
												rowSpan={2}
												className={
													clsx(
														tdClassName,
														'w-px border-b-4'
													)
												}
											>
												<TrashcanIcon onClick={() => void del(entry.id)} />
											</td>

										</tr>

										<tr>
											<td
												colSpan={9}
												className={'border p-2 border-b-4 text-center'}
											>
												{
													entry.errorStack
														? isErrorExapanded
															? entry.errorStack
															: entry.errorStack.slice(
																0,
																30
															)
														: '-'
												}

												{
													entry.errorStack && (
														<A
															className={'font-bold'}
															onClick={toggleIsErrorExpanded}
														>
															{
																isErrorExapanded
																	? '  <-'
																	: '  ...'
															}
														</A>
													)
												}
											</td>
										</tr>
									</React.Fragment>
								);

							}
						)
					}
				</tbody>
			</table>

			{
				errorsCount >= ErrorsConfig.tableInitialErrorCount * 2
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
				fullIndexCount > errorsCount
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
