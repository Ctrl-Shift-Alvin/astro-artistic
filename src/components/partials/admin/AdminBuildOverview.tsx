import {
	useState,
	useLayoutEffect
} from 'react';
import { Monolog } from '@/components/components/MonologProvider';
import { type TBuild } from '@/components/types';
import { getBuild } from '@/frontend/adminTools';
import { A } from '@/components/components/A';
import { defaultFormatDateTimeString } from '@/shared/dataParse';

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

	const get = async() => {

		const result = await getBuild(buildNumber);
		if (result) {

			setBuild(result);

		} else {

			Monolog.show({
				text: 'Failed to fetch the build!',
				durationMs: 5000
			});

		}
		return null;

	};

	useLayoutEffect(
		() => {

			void get();

		},
		[]
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
							build?.isGitDirty
								? 'Yes'
								: 'No'
						}
					</p>
				</div>

				{
					build?.buildNumber == window.__BUILD__.buildNumber
					&& (<div>
						<h1 className={'font-bold'}>
							{'Is Current Build!'}
						</h1>
					</div>)
				}
			</div>
		</>
	);

};
