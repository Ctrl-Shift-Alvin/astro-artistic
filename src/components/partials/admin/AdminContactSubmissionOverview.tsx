import {
	useState, useLayoutEffect
} from 'react';
import { Monolog } from '@/components/components/MonologProvider';
import { type TContactFormEntry } from '@/components/types';
import { getContactForm } from '@/frontend/adminTools';

export const AdminContactSubmissionOverview = ({ submissionId }: { submissionId: string }) => {

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

	useLayoutEffect(
		() => {

			void get();

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
						{'Created at'}
					</h1>

					<p>
						{submission?.createdAt}
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
