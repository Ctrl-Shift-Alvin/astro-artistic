import {
	useState, useLayoutEffect
} from 'react';
import { Button } from '@/components/components/Button';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import { type TContactFormEntry } from '@/components/types';
import {
	getContactForm,
	deleteContactForm
} from '@/frontend/adminTools';
import { goto } from '@/frontend/windowTools';

export const AdminContactSubmission = ({ submissionId }: { submissionId: string }) => {

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
				'Are you sure you want to delete this entry?',
				`This will irreversibly remove the entry with ID ${submissionId}.`
			)
		)
			return;

		const result = await deleteContactForm(submissionId);
		if (result) {

			Monolog.show({
				text: `Successfully deleted form submission with id ${submissionId}!`,
				durationMs: 2000
			});
			setTimeout(
				() => {

					goto('/admin/home/');

				},
				2000
			);

		}

	};

	useLayoutEffect(
		() => {

			void get();

		},
		[]
	);

	return (
		<>
			<div className={'mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'}>
				<div className={'sm:col-span-3'}>
					<h1 className={'font-bold'}>
						{'ID'}
					</h1>

					<p>
						{submission?.id}
					</p>
				</div>

				<div className={'sm:col-span-3'}>
					<h1 className={'font-bold'}>
						{'Created at'}
					</h1>

					<p>
						{submission?.createdAt}
					</p>
				</div>

				<div className={'sm:col-span-3'}>
					<h1 className={'font-bold'}>
						{'First Name'}
					</h1>

					<p>
						{submission?.firstName}
					</p>
				</div>

				<div className={'sm:col-span-3'}>
					<h1 className={'font-bold'}>
						{'Last Name'}
					</h1>

					<p>
						{submission?.lastName}
					</p>
				</div>

				<div className={'sm:col-span-3'}>
					<h1 className={'font-bold'}>
						{'Email'}
					</h1>

					<p>
						{submission?.email}
					</p>
				</div>

				<div className={'sm:col-span-3'}>
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

			<div className={'pt-8'}>
				<Button
					onClick={() => void remove()}
				>
					{'Remove'}
				</Button>

				<Button href={'/admin/home/'}>
					{'Back'}
				</Button>
			</div>
		</>
	);

};
