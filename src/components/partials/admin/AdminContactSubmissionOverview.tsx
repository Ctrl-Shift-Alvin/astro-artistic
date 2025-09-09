import {
	useState,
	useLayoutEffect
} from 'react';
import { addAdminButton } from './AdminButtonContainer';
import { Monolog } from '@/components/components/MonologProvider';
import { type TContactFormEntry } from '@/components/types';
import {
	deleteContactForm,
	getContactForm
} from '@/frontend/protectedApi';
import { defaultFormatDateTimeString } from '@/shared/dataParse';
import { Dialog } from '@/components/components/DialogProvider';

export const AdminContactSubmissionOverview = ({ submissionId }: { submissionId: number | string }) => {

	const [
		submission,
		setSubmission
	] = useState<TContactFormEntry>();

	const get = async() => {

		const result = await getContactForm(submissionId);
		if (result) {

			setSubmission(result);

		} else {

			Monolog.show({
				text: 'Failed to fetch the submission!',
				durationMs: 5000
			});

		}
		return null;

	};

	const remove = async() => {

		if (
			!await Dialog.yesNo(
				'Are you sure you want to delete this contact form submission?',
				`This will irreversibly remove the contact form submission with ID ${submissionId}.`
			)
		)
			return;

		const result = await deleteContactForm(submissionId);
		if (result) {

			Monolog.show({
				text: `Successfully deleted form submission with id ${submissionId}!`,
				durationMs: 3000
			});
			void get();

		}

	};

	useLayoutEffect(
		() => {

			void get();

		},
		[]
	);

	useLayoutEffect(
		() => {

			addAdminButton({
				children: 'Remove',
				onClick: () => void remove()
			});

		},
		[]
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
