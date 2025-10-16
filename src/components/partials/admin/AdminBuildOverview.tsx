import {
	useState,
	useLayoutEffect
} from 'react';
import { addAdminButton } from './AdminButtonContainer';
import { type TBuild } from '@/components/types';
import {
	deleteBuild,
	fetchBuild
} from '@/frontend/adminApi';
import { A } from '@/components/elements/A';
import { defaultFormatDateTimeString } from '@/shared/time';

/**
 * An overview of a single build including its corresponding errors,
 * and a way to access all of them, that works through the protected admin API.
 */
export const AdminBuildOverview = ({ buildNumber }: { buildNumber: number | string }) => {

	const [
		build,
		setBuild
	] = useState<TBuild>();

	const [
		isCommitExpanded,
		setIsCommitExpanded
	] = useState<boolean>(false);

	const toggleIsCommitExpanded = () => {

		setIsCommitExpanded(!isCommitExpanded);

	};

	useLayoutEffect(
		() => {

			void fetchBuild(
				buildNumber,
				true
			).then(
				(result) => {

					if (result) {

						setBuild(result);

					}

				}
			);

		},
		[ buildNumber ]
	);

	useLayoutEffect(
		() => {

			addAdminButton({
				children: 'Remove',
				onClick: () => void deleteBuild(
					buildNumber,
					true
				)
			});

		},
		[ buildNumber ]
	);

	return (
		<>
			<div className={'w-full mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 text-center text-2xl break-words'}>
				<div>
					<h1 className={'font-bold'}>
						{'Build Number'}
					</h1>

					<p>
						{build?.buildNumber}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Created At'}
					</h1>

					<p>
						{defaultFormatDateTimeString(new Date(build?.createdAt ?? ''))}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Git Branch'}
					</h1>

					<p>
						{build?.gitBranch}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Last Git Commit'}
					</h1>

					<p>
						{
							isCommitExpanded
								? build?.gitCommit
								: build?.gitCommit.slice(
									0,
									12
								)
						}

						<A
							className={'font-bold'}
							onClick={toggleIsCommitExpanded}
						>
							{
								isCommitExpanded
									? '  <-'
									: '  ...'
							}
						</A>
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Was Git Dirty'}
					</h1>

					<p>
						{
							build?.isGitDirty ?? false
								? 'Yes'
								: 'No'
						}
					</p>
				</div>

				{
					build?.buildNumber == window.__BUILD__.buildNumber
					&& (
						<div>
							<h1 className={'font-bold'}>
								{'Is Current Build!'}
							</h1>
						</div>
					)
				}
			</div>
		</>
	);

};
