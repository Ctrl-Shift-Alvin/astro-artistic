import {
	useState,
	useLayoutEffect,
	useCallback
} from 'react';
import { addAdminButton } from './AdminButtonContainer';
import { type TContactFormEntry } from '@/components/types';
import {
	deleteContactEntry,
	fetchContactEntry
} from '@/frontend/adminApi';
import { defaultFormatDateTimeString } from '@/shared/time';

/**
 * An overview of a single contact form submission, that works through the protected admin API.
 */
export const AdminContactOverview = ({ submissionId }: { submissionId: number | string }) => {

	const [
		submission,
		setSubmission
	] = useState<TContactFormEntry>();

	const get = useCallback(
		async() => {

			const result = await fetchContactEntry(
				submissionId,
				true
			);
			if (result) {

				setSubmission(result);

			}

		},
		[ submissionId ]
	);

	const remove = useCallback(
		async() => {

			await deleteContactEntry(
				submissionId,
				true
			);

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
				onClick: () => void remove()
			});

		},
		[ remove ]
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
						{'First Name'}
					</h1>

					<p>
						{submission?.firstName}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Last Name'}
					</h1>

					<p>
						{submission?.lastName}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Email'}
					</h1>

					<p>
						{submission?.email}
					</p>
				</div>

				<div>
					<h1 className={'font-bold'}>
						{'Phone Number'}
					</h1>

					<p>
						{submission?.phoneNumber}
					</p>
				</div>

				<div className={'col-span-full'}>
					<h1 className={'font-bold'}>
						{'Message'}
					</h1>

					<p className={'w-full break-words'}>
						{submission?.message}
					</p>
				</div>
			</div>
		</>
	);

};
