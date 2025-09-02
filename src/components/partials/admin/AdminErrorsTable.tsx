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
	countErrorsByBuild
} from '@/frontend/adminTools';
import { ErrorsConfig } from '@/shared/config/errors';
import { A } from '@/components/components/A';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import { defaultFormatDateTimeString } from '@/shared/dataParse';

export const AdminErrorsTable = ({ buildNumber }: { buildNumber?: number }) => {

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

	const remove = async(id: number | string) => {

		if (
			!await Dialog.yesNo(
				'Are you sure you want to delete this error?',
				`This will irreversibly remove the error with the ID '${id}'.`
			)
		)
			return;

		const result = await deleteError(id);
		if (result) {

			Monolog.show({ text: `Successfully deleted error '${id}'!` });

		} else {

			Monolog.show({ text: `Failed deleting error '${id}'!` });

		}

		void index(errorsCount);

	};

	const increaseCount = () => {

		setErrorsCount((prev) => prev + ErrorsConfig.tableInitialErrorCount);

	};

	const decreaseCount = () => {

		setErrorsCount((prev) => prev - ErrorsConfig.tableInitialErrorCount);

	};

	useLayoutEffect(
		() => {

			void count();

		},
		[ count ]
	);

	useLayoutEffect(
		() => {

			void index(errorsCount);

		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ errorsCount ]
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
												href={`/admin/submission/error/${entry.id}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}
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
												href={`/admin/submission/build/${entry.buildNumber}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}
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
												onClick={() => void remove(entry.buildNumber)}
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
