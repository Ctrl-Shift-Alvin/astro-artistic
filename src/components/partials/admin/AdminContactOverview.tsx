import {
	useState,
	useLayoutEffect
} from 'react';
import { addAdminButton } from './AdminButtonContainer';
import { type TContactFormEntry } from '@/components/types';
import {
	deleteContactForm,
	fetchContactForm
} from '@/frontend/adminApi';
import { defaultFormatDateTimeString } from '@/shared/dataParse';

export const AdminContactOverview = ({ submissionId }: { submissionId: number | string }) => {

	const [
		submission,
		setSubmission
	] = useState<TContactFormEntry>();

	const get = async() => {

		const result = await fetchContactForm(
			submissionId,
			true
		);
		if (result) {

			setSubmission(result);

		}

	};

	const remove = async() => {

		await deleteContactForm(
			submissionId,
			true
		);

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
