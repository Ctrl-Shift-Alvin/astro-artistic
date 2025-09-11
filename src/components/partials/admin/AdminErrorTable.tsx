import React, {
	useCallback,
	useLayoutEffect,
	useState
} from 'react';
import { type TError } from '@/components/types';
import {
	getErrorIndex,
	deleteError,
	getErrorIndexByBuild,
	countErrors,
	countErrorsByBuild,
	getPrevUrlQuery
} from '@/frontend/adminApi';
import { ErrorsConfig } from '@/shared/config/errors';
import { A } from '@/components/components/A';
import { defaultFormatDateTimeString } from '@/shared/dataParse';

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

				setErrorsIndex((prev) => prev.slice(
					0,
					count
				));
				return;

			}

			// Otherwise, fetch only missing rows
			const result = buildNumber
				? await getErrorIndexByBuild(
					buildNumber,
					count - errorsIndex.length,
					errorsIndex.length
				)
				: await getErrorIndex(
					count - errorsIndex.length,
					errorsIndex.length
				);

			if (result == null)
				return;

			setErrorsIndex((prev) => [
				...prev,
				...result
			].slice(
				0,
				errorsCount
			));

		},
		[
			buildNumber,
			errorsCount,
			errorsIndex.length
		]
	);

	const count = useCallback(
		async() => {

			const result = buildNumber
				? await countErrorsByBuild(buildNumber)
				: await countErrors();
			if (result === null)
				return;

			setFullIndexCount(result);

		},
		[ buildNumber ]
	);

	const del = useCallback(
		async(id: number | string) => {

			await deleteError(id);
			setErrorsIndex([]); // Refetch all errors, but keep the shown count
			void index(errorsCount);

		},
		[
			errorsCount,
			index
		]
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

			void count();
			void index(errorsCount);

		},
		[
			errorsCount,
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
							{'Created At'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Build Number'}
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

						<td className={'border p-2 font-bold'}>
							{'D'}
						</td>

					</tr>
				</thead>

				<tbody>
					{
						errorsIndex.map((entry) => {

							const isErrorExapanded = expandedRows[entry.buildNumber] ?? false;

							const toggleIsErrorExpanded = () => {

								setExpandedRows((previous) => ({
									...previous,
									[entry.buildNumber]: !isErrorExapanded
								}));

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
											className={tdClassName}
										>
											<A
												className={'text-red-600 text-center'}
												onClick={() => void del(entry.id)}
											>
												{'D'}
											</A>
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

						})
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
