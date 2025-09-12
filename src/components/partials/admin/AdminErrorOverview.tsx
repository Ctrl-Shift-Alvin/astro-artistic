import {
	useState,
	useLayoutEffect,
	useCallback
} from 'react';
import { addAdminButton } from './AdminButtonContainer';
import { Monolog } from '@/components/components/MonologProvider';
import { type TError } from '@/components/types';
import {
	deleteError,
	fetchError
} from '@/frontend/adminApi';
import { defaultFormatDateTimeString } from '@/shared/dataParse';
import { A } from '@/components/components/A';

export const AdminErrorOverview = ({ submissionId }: { submissionId: number | string }) => {

	const [
		submission,
		setSubmission
	] = useState<TError>();

	const [
		isStackExpanded,
		setIsStackExpanded
	] = useState<boolean>(false);

	const toggleIsStackExpanded = useCallback(
		() => {

			setIsStackExpanded(!isStackExpanded);

		},
		[ isStackExpanded ]
	);

	const get = useCallback(
		async() => {

			const result = await fetchError(
				submissionId,
				true
			);
			if (result) {

				setSubmission(result);

			} else {

				Monolog.show({
					text: 'Failed to fetch the submission!',
					durationMs: 5000
				});

			}
			return null;

		},
		[ submissionId ]
	);

	useLayoutEffect(
		() => {

			void get();

		},
		[ get ]
	);

	useLayoutEffect(
		() => {

			addAdminButton({
				children: 'Remove',
				onClick: () => void deleteError(
					submissionId,
					true
				)
			});

		},
		[ submissionId ]
	);

	return (
		<>
			<div className={'w-full mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 text-center text-2xl'}>
				<div>
					<h1 className={'font-bold'}>
						{'ID'}
					</h1>

					<p>
						{submission?.id}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Created At'}
					</h1>

					<p>
						{defaultFormatDateTimeString(new Date(submission?.createdAt ?? ''))}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Build Number'}
					</h1>

					<p>
						<A
							className={'underline'}
							href={`/admin/submission/build/${submission?.buildNumber}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}
						>
							{submission?.buildNumber}
						</A>
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Is Client'}
					</h1>

					<p>
						{
							submission?.isClient
								? 'Yes'
								: 'No'
						}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Status'}
					</h1>

					<p>
						{submission?.status ?? '-'}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Status Text'}
					</h1>

					<p>
						{submission?.statusText ?? '-'}
					</p>
				</div>

				<div className={'col-span-full'}>
					<h1 className={'font-bold'}>
						{'Error Message'}
					</h1>

					<p>
						{submission?.errorMessage ?? '-'}
					</p>
				</div>

				<div className={'col-span-full'}>
					<h1 className={'font-bold'}>
						{'Error Cause'}
					</h1>

					<p>
						{submission?.errorCause ?? '-'}
					</p>
				</div>

				<div className={'col-span-full'}>
					<h1 className={'font-bold'}>
						{'Error Cause'}
					</h1>

					<p>
						{
							(isStackExpanded
								? submission?.errorStack
								: submission?.errorStack?.slice(
									0,
									20
								)
							) ?? '-'
						}

						<A
							className={'font-bold'}
							onClick={toggleIsStackExpanded}
						>
							{
								submission?.errorStack
									? isStackExpanded
										? '  <-'
										: '  ...'
									: ''
							}
						</A>
					</p>
				</div>

			</div>
		</>
	);

};
