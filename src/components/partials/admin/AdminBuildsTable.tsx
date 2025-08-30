import {
	useCallback,
	useLayoutEffect,
	useState
} from 'react';
import clsx from 'clsx/lite';
import { TBuild } from '@/components/types';
import {
	getBuildIndex,
	deleteBuild,
	countBuilds
} from '@/frontend/adminTools';
import { ErrorsConfig } from '@/shared/config/errors';
import { A } from '@/components/components/A';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import { defaultFormatDateTimeString } from '@/shared/dataParse';

export const AdminBuildsTable = () => {

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

			// If count decreased, just slice the builds index
			if (buildsIndex.length >= count) {

				setBuildsIndex((prev) => prev.slice(
					0,
					count
				));
				return;

			}

			// Otherwise, fetch only missing rows
			const result = await getBuildIndex(
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

	const remove = async(buildNumber: number | string) => {

		if (
			!await Dialog.yesNo(
				'Are you sure you want to delete this build?',
				`This will irreversibly remove the build with the build number '${buildNumber}'.`
			)
		)
			return;

		const result = await deleteBuild(buildNumber);
		if (result) {

			Monolog.show({ text: `Successfully deleted build '${buildNumber}'!` });

		} else {

			Monolog.show({ text: `Failed deleting build '${buildNumber}'!` });

		}

		void index(buildsCount);

	};

	const count = async() => {

		const result = await countBuilds();
		if (result === null)
			return;

		setFullIndexCount(result);

	};

	const increaseCount = () => {

		setBuildsCount((prev) => prev + ErrorsConfig.tableInitialBuildCount);

	};

	const decreaseCount = () => {

		setBuildsCount((prev) => prev - ErrorsConfig.tableInitialBuildCount);

	};

	useLayoutEffect(
		() => {

			void count();

		},
		[]
	);

	useLayoutEffect(
		() => {

			void index(buildsCount);

		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ buildsCount ]
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

						<td className={'border p-2 font-bold'}>
							{'D'}
						</td>
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

							const tdClassName = clsx(
								'border p-2',
								entry.buildNumber == window.__BUILD__.buildNumber && 'border-4'
							);
							return (
								<tr key={entry.buildNumber}>

									<td className={tdClassName}>
										{entry.buildNumber}
									</td>

									<td className={tdClassName}>
										{defaultFormatDateTimeString(new Date(entry.createdAt))}
									</td>

									<td className={tdClassName}>
										{entry.gitBranch}
									</td>

									<td className={tdClassName}>
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

									<td className={tdClassName}>
										{
											entry.isGitDirty
												? 'Yes'
												: 'No'
										}
									</td>

									<td className={tdClassName}>
										<A
											className={'text-red-600 text-center'}
											onClick={() => void remove(entry.buildNumber)}
										>
											{'D'}
										</A>
									</td>

									{

										// TODO Add error search based on build
									}
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
