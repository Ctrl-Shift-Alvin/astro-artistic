import {
	useCallback,
	useLayoutEffect,
	useState
} from 'react';
import clsx from 'clsx/lite';
import { type TBuild } from '@/components/types';
import {
	fetchBuildIndex,
	fetchBuildCount,
	deleteBuild,
	getPrevUrlQuery
} from '@/frontend/adminApi';
import { ErrorsConfig } from '@/shared/config/errors';
import { A } from '@/components/elements/A';
import { defaultFormatDateTimeString } from '@/shared/dataParse';
import { TrashcanIcon } from '@/components/components/icons/TrashcanIcon';

export const AdminBuildTable = () => {

	const [
		buildsIndex,
		setBuildsIndex
	] = useState<TBuild[]>([]);

	const [
		fullIndexCount,
		setFullIndexCount
	] = useState(0);

	const [
		buildsCount,
		setBuildsCount
	] = useState(ErrorsConfig.tableInitialBuildCount);

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
			if (count == buildsIndex.length)
				return;

			// If count decreased, just slice the builds index
			if (buildsIndex.length >= count) {

				setBuildsIndex((prev) => prev.slice(
					0,
					count
				));
				return;

			}

			// Otherwise, fetch only missing rows
			const result = await fetchBuildIndex(
				count - buildsIndex.length,
				buildsIndex.length
			);
			if (result === null)
				return;

			setBuildsIndex((prev) => [
				...prev,
				...result
			].slice(
				0,
				buildsCount
			));

		},
		[
			buildsCount,
			buildsIndex.length
		]
	);

	const remove = useCallback(
		async(buildNumber: number | string) => {

			await deleteBuild(buildNumber);
			void index(buildsCount);

		},
		[
			buildsCount,
			index
		]
	);

	const count = useCallback(
		async() => {

			const result = await fetchBuildCount();
			if (result) {

				setFullIndexCount(result);

			}

		},
		[]
	);

	const increaseCount = useCallback(
		() => {

			setBuildsCount((prev) => prev + ErrorsConfig.tableInitialBuildCount);

		},
		[]
	);

	const decreaseCount = useCallback(
		() => {

			setBuildsCount((prev) => prev - ErrorsConfig.tableInitialBuildCount);

		},
		[]
	);

	useLayoutEffect(
		() => {

			void count();
			void index(buildsCount);

		},
		[
			buildsCount,
			count,
			index
		]
	);

	return (
		<>
			<table className={'w-4/6 border-collapse border border-gray-300'}>
				<thead>
					<tr>
						<td className={'border p-2 font-bold'}>
							{'Build Number'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Created At'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Git Branch'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Git Commit'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Was Git Dirty'}
						</td>

						<td />
					</tr>
				</thead>

				<tbody>
					{
						buildsIndex.map((entry) => {

							const isGitCommitExpanded = expandedRows[entry.buildNumber] ?? false;

							const toggleIsCommitExpanded = () => {

								setExpandedRows((previous) => ({
									...previous,
									[entry.buildNumber]: !isGitCommitExpanded
								}));

							};

							const tdClassName = clsx('border p-2');
							return (
								<tr key={entry.buildNumber}>

									<td
										className={
											clsx(
												tdClassName,
												entry.buildNumber == window.__BUILD__.buildNumber && 'border-4 border-r-1'
											)
										}
									>
										<A
											className={'text-center underline'}
											href={`/admin/submission/build/${entry.buildNumber}/${getPrevUrlQuery()}`}
										>
											{entry.buildNumber}
										</A>
									</td>

									<td
										className={
											clsx(
												tdClassName,
												entry.buildNumber == window.__BUILD__.buildNumber && 'border-4 border-x-1'
											)
										}
									>
										{defaultFormatDateTimeString(new Date(entry.createdAt))}
									</td>

									<td
										className={
											clsx(
												tdClassName,
												entry.buildNumber == window.__BUILD__.buildNumber && 'border-4 border-x-1'
											)
										}
									>
										{entry.gitBranch}
									</td>

									<td
										className={
											clsx(
												tdClassName,
												entry.buildNumber == window.__BUILD__.buildNumber && 'border-4 border-x-1'
											)
										}
									>
										{
											isGitCommitExpanded
												? entry.gitCommit
												: entry.gitCommit.slice(
													0,
													12
												)
										}

										<A
											className={'font-bold'}
											onClick={toggleIsCommitExpanded}
										>
											{
												isGitCommitExpanded
													? '  <-'
													: '  ...'
											}
										</A>
									</td>

									<td
										className={
											clsx(
												tdClassName,
												entry.buildNumber == window.__BUILD__.buildNumber && 'border-4 border-x-1'
											)
										}
									>
										{
											entry.isGitDirty
												? 'Yes'
												: 'No'
										}
									</td>

									<td
										className={
											clsx(
												tdClassName,
												'w-px',
												entry.buildNumber == window.__BUILD__.buildNumber && 'border-4 border-l-1'
											)
										}
									>
										<TrashcanIcon onClick={() => void remove(entry.buildNumber)} />
									</td>
								</tr>
							);

						})
					}
				</tbody>
			</table>

			{
				buildsCount >= ErrorsConfig.tableInitialBuildCount * 2
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
				fullIndexCount > buildsCount
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
