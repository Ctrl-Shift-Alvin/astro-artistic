import {
	useLayoutEffect,
	useState
} from 'react';
import { A } from '@/components/components/A';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import { type TContactFormEntry } from '@/components/types';
import {
	getContactForms,
	deleteContactForm
} from '@/frontend/protectedApi';

export const AdminContactSubmissionTable = () => {

	const [
		formSubmissions,
		setFormSubmissions
	] = useState<TContactFormEntry[]>([]);

	const get = async() => {

		const result = await getContactForms();
		if (result) {

			setFormSubmissions(result);

		}

	};
	const remove = async(id: number) => {

		if (
			!await Dialog.yesNo(
				'Are you sure you want to delete this entry?',
				`This will irreversibly remove the entry with ID ${id}.`
			)
		)
			return;

		const result = await deleteContactForm(id);
		if (result) {

			Monolog.show({
				text: `Successfully deleted form submission with id ${id}!`,
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
	return (
		<>
			<table className={'w-4/6 border-collapse border border-gray-300'}>
				<thead>
					<tr>
						<td className={'border p-2 font-bold'}>
							{'ID'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'First Name'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Last Name'}
						</td>

						<td className={'w-4/7 border p-2 font-bold'}>
							{'Message'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'D'}
						</td>
					</tr>
				</thead>

				<tbody>
					{
						formSubmissions.map((entry) => (
							<tr key={entry.id}>

								<td className={'border p-2 underline'}>
									<A href={`/admin/submission/contact/${entry.id}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}>
										{entry.id}
									</A>
								</td>

								<td className={'border p-2'}>
									{entry.firstName}
								</td>

								<td className={'border p-2'}>
									{entry.lastName}
								</td>

								<td className={'max-w-44 truncate border p-2 overflow-ellipsis'}>
									{entry.message}
								</td>

								<td className={'border p-2'}>
									<A
										className={'text-red-600'}
										onClick={() => void remove(entry.id)}
									>
										{'D'}
									</A>
								</td>
							</tr>
						))
					}
				</tbody>
			</table>
		</>
	);

};
