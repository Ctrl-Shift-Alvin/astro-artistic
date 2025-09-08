import {
	useState,
	useLayoutEffect
} from 'react';
import { z } from 'zod';
import { A } from '@/components/components/A';
import { Button } from '@/components/components/Button';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import {
	type TEventsEntry,
	type TNewEventsEntry
} from '@/components/types';
import {
	getEventsIndex,
	addEventsEntry,
	deleteEventsEntry
} from '@/frontend/adminTools';
import { cGetUserLanguage } from '@/shared/cookies';
import { defaultLanguageCode } from '@/backend/i18n';

const ZFormValues = z.object({
	title: z
		.string()
		.nonempty(),
	location: z
		.string()
		.nonempty(),
	day: z.coerce
		.number()
		.min(1)
		.max(31),
	month: z.coerce
		.number()
		.min(1)
		.max(12),
	year: z.coerce
		.number()
		.min(1970),
	hours: z.coerce
		.number()
		.min(0)
		.max(23),
	minutes: z.coerce
		.number()
		.min(0)
		.max(59),
	enablePage: z.boolean()
});
type IFormValues = z.infer<typeof ZFormValues>;

const EventForm = ({
	formValues,
	setFormValues
}: {
	formValues: IFormValues;
	setFormValues: (newValues: IFormValues)=> void;
}) => (
	<form>
		<div>
			<label
				htmlFor={'title'}
				className={'pr-4 text-white'}
			>
				{'Title'}
			</label>

			<input
				id={'title'}
				className={'w-full border-1 border-white text-white'}
				value={formValues.title}
				onChange={
					(e) => {

						setFormValues({
							...formValues,
							title: e.target.value
						});

					}
				}
			/>
		</div>

		<div>
			<label
				htmlFor={'location'}
				className={'pr-4 text-white'}
			>
				{'Location'}
			</label>

			<input
				id={'location'}
				className={'w-full border-1 border-white text-white'}
				value={formValues.location}
				onChange={
					(e) => {

						setFormValues({
							...formValues,
							location: e.target.value
						});

					}
				}
			/>
		</div>

		<div className={'grid grid-cols-1 sm:grid-cols-5'}>
			<div>
				<label
					htmlFor={'day'}
					className={'text-white'}
				>
					{'Day'}
				</label>

				<input
					id={'day'}
					type={'number'}
					min={'1'}
					max={'31'}
					maxLength={2}
					value={formValues.day}
					className={'w-full border-1 border-white text-white'}
					onChange={
						(e) => {

							setFormValues({
								...formValues,
								day: Number(e.target.value)
							});

						}
					}
				/>
			</div>

			<div>
				<label
					htmlFor={'month'}
					className={'text-white'}
				>
					{'Month'}
				</label>

				<input
					id={'month'}
					type={'number'}
					min={'1'}
					max={'12'}
					maxLength={2}
					value={formValues.month}
					className={'w-full border-1 border-white text-white'}
					onChange={
						(e) => {

							setFormValues({
								...formValues,
								month: Number(e.target.value)
							});

						}
					}

				/>
			</div>

			<div>
				<label
					htmlFor={'year'}
					className={'text-white'}
				>
					{'Year'}
				</label>

				<input
					id={'year'}
					type={'number'}
					min={'1900'}
					max={'3000'}
					maxLength={4}
					value={formValues.year}
					className={'w-full border-1 border-white text-white'}
					onChange={
						(e) => {

							setFormValues({
								...formValues,
								year: Number(e.target.value)
							});

						}
					}
				/>
			</div>

			<div>
				<label
					htmlFor={'hours'}
					className={'text-white'}
				>
					{'Hours'}
				</label>

				<input
					id={'hours'}
					type={'number'}
					min={'0'}
					max={'23'}
					maxLength={2}
					value={formValues.hours}
					className={'w-full border-1 border-white text-white'}
					onChange={
						(e) => {

							setFormValues({
								...formValues,
								hours: Number(e.target.value)
							});

						}
					}
				/>
			</div>

			<div>
				<label
					htmlFor={'minutes'}
					className={'text-white'}
				>
					{'Minutes'}
				</label>

				<input
					id={'minutes'}
					type={'number'}
					min={'0'}
					max={'59'}
					maxLength={2}
					value={formValues.minutes}
					className={'w-full border-1 border-white text-white'}
					onChange={
						(e) => {

							setFormValues({
								...formValues,
								minutes: Number(e.target.value)
							});

						}
					}
				/>
			</div>
		</div>

		<div className={'flex justify-center items-center mt-2'}>
			<label
				htmlFor={'enablePage'}
				className={'pr-4 text-white'}
			>
				{'Enable Page'}
			</label>

			<input
				id={'enablePage'}
				type={'checkbox'}
				checked={formValues.enablePage}
				className={'size-5'}
				onChange={
					(e) => {

						setFormValues({
							...formValues,
							enablePage: e.target.checked
						});

					}
				}
			/>
		</div>
	</form>
);

export const AdminEventsTable = () => {

	const [
		eventEntries,
		setEventEntries
	] = useState<TEventsEntry[]>([]);

	const fetch = async() => {

		const result = await getEventsIndex();

		if (result) {

			setEventEntries(result);

		} else {

			Monolog.show({
				text: 'Failed to fetch event entries!',
				durationMs: 5000
			});

		}

	};
	const add = async() => {

		const formResult = await showAddDialog();
		if (!formResult)
			return;

		const newEventEntry: TNewEventsEntry = {
			title: formResult.title,
			location: formResult.location,
			dateTime: new Date(
				formResult.year,
				formResult.month - 1,
				formResult.day,
				formResult.hours,
				formResult.minutes
			).toISOString(),
			enablePage: formResult.enablePage
		};

		const result = await addEventsEntry(newEventEntry);

		if (result) {

			Monolog.show({
				text: 'Successfully added a new event entry!',
				durationMs: 3000
			});
			void fetch();

		} else {

			Monolog.show({
				text: 'Failed to add new event entry!',
				durationMs: 5000
			});

		}

	};
	const remove = async(id: string | number) => {

		if (
			!await Dialog.yesNo(
				'Are you sure you want to delete this entry?',
				`This will irreversibly remove the entry with ID ${id}.`
			)
		)
			return;

		const result = await deleteEventsEntry(id);

		if (result) {

			void fetch();
			Monolog.show({
				text: 'Successfully removed event entry!',
				durationMs: 3000
			});

		} else {

			Monolog.show({
				text: 'Failed to remove event entry!',
				durationMs: 5000
			});

		}

	};

	const showAddDialog = async(): Promise<IFormValues | null> => {

		const submitCallback = (formValues: IFormValues): boolean => {

			const result = ZFormValues.safeParse(formValues);
			if (!result.success) {

				Monolog.show({
					text: `Empty/Invalid value for '${
						result.error.issues[0]?.path
							.toString()
							.capitalize()
					}'!`,
					durationMs: 5000
				});
				return false;

			}
			return true;

		};

		return await Dialog.form<IFormValues>(
			'Add New Event',
			{
				body: (
					formValues,
					setFormValues
				) => (
					<EventForm
						formValues={formValues}
						setFormValues={setFormValues}
					/>
				),
				onSubmit: submitCallback,
				initialValue: {
					title: '',
					location: '',
					day: 1,
					month: 1,
					year: new Date().getUTCFullYear(),
					hours: 18,
					minutes: 0,
					enablePage: true
				}
			}
		);

	};

	useLayoutEffect(
		() => void fetch(),
		[]
	);

	return (
		<>
			<table className={'w-4/6 border-collapse border border-gray-300'}>
				<thead>
					<tr>
						<td className={'w-1/12 border p-2 font-bold'}>
							{'ID'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Title'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Location'}
						</td>

						<td className={'w-1/6 border p-2 font-bold'}>
							{'Date & Time'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'Page'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'D'}
						</td>
					</tr>
				</thead>

				<tbody>
					{
						eventEntries
							.sort((
								a,
								b
							) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
							.map((entry) => (
								<tr key={entry.id}>

									<td className={'border p-2'}>
										<A
											className={'underline'}
											href={`/admin/events/${entry.id}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}
										>
											{entry.id}
										</A>
									</td>

									<td className={'border p-2'}>
										{entry.title}
									</td>

									<td className={'border p-2'}>
										{entry.location}
									</td>

									<td className={'border p-2'}>
										{
											Intl
												.DateTimeFormat(
													cGetUserLanguage() ?? defaultLanguageCode,
													{
														year: 'numeric',
														month: 'numeric',
														day: 'numeric',
														hour: 'numeric',
														minute: 'numeric'
													}
												)
												.format(new Date(entry.dateTime))
										}
									</td>

									<td className={'border p-2'}>
										{
											entry.enablePage
												?	(
													<A
														className={'underline'}
														href={`/events/${entry.id}/`}
													>
														{'Yes'}
													</A>
												)
												: (
													<p>
														{'No'}
													</p>
												)
										}
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

			<div className={'flex w-full flex-row justify-evenly'}>
				<Button
					small={true}
					onClick={() => void add()}
				>
					{'Add'}
				</Button>
			</div>
		</>
	);

};
