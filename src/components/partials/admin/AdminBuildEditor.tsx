import {
	useLayoutEffect, useState
} from 'react';
import { TBuild } from '@/components/types';
import {
	getBuildsIndex, removeBuild
} from '@/frontend/adminTools';
import { ErrorsConfig } from '@/shared/config/errors';
import { A } from '@/components/components/A';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';

export const AdminBuildEditor = () => {

	const [
		buildsIndex,
		setBuildsIndex
	] = useState<TBuild[]>([]);

	const [
		indexSize,
		setIndexSize
	] = useState(0);

	const [
		buildsCount,
		setBuildsCount
	] = useState(ErrorsConfig.tableInitialEntryCount);

	const [
		expandedRows,
		setExpandedRows
	] = useState<Record<number, boolean>>({});

	const index = async(count: number | string) => {

		const result = await getBuildsIndex(count);
		if (!result)
			return;

		setIndexSize(result.count);
		setBuildsIndex(result.data);

	};

	const remove = async(buildNumber: number | string) => {

		if (
			!await Dialog.yesNo(
				'Are you sure you want to delete this build?',
				`This will irreversibly remove the build with the build number '${buildNumber}'.`
			)
		)
			return;

		const result = await removeBuild(buildNumber);
		if (result) {

			Monolog.show({ text: `Successfully deleted build '${buildNumber}'!` });

		} else {

			Monolog.show({ text: `Failed deleting build '${buildNumber}'!` });

		}

		void index(buildsCount);

	};

	const increaseCount = () => {

		setBuildsCount((prev) => prev + ErrorsConfig.tableInitialEntryCount);

	};

	useLayoutEffect(
		() => {

			void index(buildsCount);

		},
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

							return (
								<tr key={entry.buildNumber}>

									<td className={'border p-2'}>
										{entry.buildNumber}
									</td>

									<td className={'border p-2'}>
										{entry.createdAt}
									</td>

									<td className={'border p-2'}>
										{entry.gitBranch}
									</td>

									<td className={'border p-2'}>
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

									<td className={'border p-2'}>
										{
											entry.isGitDirty
												? 'Yes'
												: 'No'
										}
									</td>

									<td className={'border p-2'}>
										<A
											className={'text-red-600 text-center'}
											onClick={() => void remove(entry.buildNumber)}
										>
											{'D'}
										</A>
									</td>

									{

										// TODO Add error search based on build

										// TODO Add highlighting of current build
									}
								</tr>
							);

						})
					}
				</tbody>
			</table>

			{
				indexSize > buildsCount
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
