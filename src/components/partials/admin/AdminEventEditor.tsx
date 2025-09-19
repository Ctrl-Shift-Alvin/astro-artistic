import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState
} from 'react';
import clsx from 'clsx/lite';
import { DatePicker } from 'react-datepicker';
import { AdminMarkdownEditor } from './AdminMarkdownEditor';
import { addAdminButton } from './AdminButtonContainer';
import { Monolog } from '@/components/components/MonologProvider';
import {
	ZNewEventEntry,
	type TEventEntry
} from '@/components/types';
import {
	addEvent,
	deleteEvent,
	editEvent,
	fetchEvent,
	fetchEventIndex,
	gotoPrevOrHome,
	saveEvent
} from '@/frontend/adminApi';
import {
	enableUnloadConfirmation,
	disableUnloadConfirmation,
	goto
} from '@/frontend/windowTools';
import { LabeledInput } from '@/components/elements/LabeledInput';
import { Label } from '@/components/elements/Label';
import { LabeledCheckbox } from '@/components/elements/LabeledCheckbox';

// eslint-disable-next-line import-x/no-unassigned-import
import 'react-datepicker/dist/react-datepicker.css';

export const AdminEventsEditorOverview = ({ eventId }: { eventId?: number }) => {

	const [
		eventEntry,
		_setEventEntry
	] = useState<TEventEntry>();
	const [
		eventEntryChanged,
		setEventEntryChanged
	] = useState<boolean>(false);
	const setEventEntry = useCallback(
		(value: typeof eventEntry) => {

			_setEventEntry((prev) => {

				if (prev) {

					setEventEntryChanged(true);

				}

				return value;

			});

		},
		[]
	);

	const [
		fileContent,
		_setFileContent
	] = useState<string>();
	const [
		fileContentChanged,
		setFileContentChanged
	] = useState<boolean>(false);
	const setFileContent = useCallback(
		(value: typeof fileContent) => {

			_setFileContent((prev) => {

				if (prev) {

					setFileContentChanged(true);

				}
				return value;

			});

		},
		[]
	);

	useEffect(
		() => {

			if (eventEntryChanged || fileContentChanged)
				enableUnloadConfirmation();
			else
				disableUnloadConfirmation();

		},
		[
			eventEntryChanged,
			fileContentChanged
		]
	);

	const isNewEntry = useMemo(
		() => eventId === undefined,
		[ eventId ]
	);

	const get = useCallback(
		async() => {

			if (isNewEntry) {

				setEventEntry({
					id: -1,
					createdAt: 'To Be Determined',
					title: '',
					dateTime: new Date().toISOString(),
					location: '',
					enablePage: true
				});
				return;

			}

			const result = await fetchEvent(
				eventId as number, // isNewEntry being false means eventId is a number!
				true
			);
			if (result) {

				setEventEntry(result.data);

				if (result.file)
					setFileContent(result.file);

			}

		},
		[
			eventId,
			isNewEntry,
			setEventEntry,
			setFileContent
		]
	);
	const edit = useCallback(
		async() => {

			if (!eventEntry)
				return;

			// Validate fields
			const result = ZNewEventEntry.safeParse(eventEntry);
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

			if (isNewEntry) {

				await addEvent(eventEntry);
				return true;

			}

			if (
				await editEvent(
					eventId as number, // isNewEntry being false means eventId is a number!
					eventEntry
				)
			) {

				setEventEntryChanged(false);
				void get();

			}
			return true;

		},
		[
			eventEntry,
			eventId,
			get,
			isNewEntry
		]
	);
	const save = useCallback(
		async() => {

			if (!eventId || !fileContent)
				return;

			if (
				await saveEvent(
					eventId,
					fileContent
				)
			) {

				setFileContentChanged(false);

			}

		},
		[
			eventId,
			fileContent
		]
	);
	const saveEdit = useCallback(
		async() => {

			if (eventEntryChanged || isNewEntry) {

				if (!await edit())
					return;

			}
			if (fileContentChanged) {

				await save();

			}

			if (isNewEntry) {

				disableUnloadConfirmation();

				const newIndex = await fetchEventIndex();
				if (!newIndex || newIndex.length < 1) {

					gotoPrevOrHome();
					return;

				}

				const newId = newIndex
					.toSorted((
						a,
						b
					) => b.createdAt.localeCompare(a.createdAt))[0]!.id;
				goto(`/admin/events/${newId.toString()}/${location.search}`);
				return;

			}

			if (!eventEntryChanged && !fileContentChanged) {

				Monolog.show({ text: 'Successfully saved: No changes made!' });
				return;

			}

		},
		[
			eventEntryChanged,
			fileContentChanged,
			isNewEntry,
			edit,
			save
		]
	);

	useLayoutEffect(
		() => {

			addAdminButton({
				children: 'Save',
				onClick: () => void saveEdit()
			});

			if (isNewEntry && eventId) {

				addAdminButton({
					children: 'Delete',
					onClick: () => void deleteEvent(
						eventId,
						true
					)
				});

			}

		},
		[
			eventId,
			isNewEntry,
			saveEdit
		]
	);

	useEffect(
		() => {

			void get();

		},
		[ get ]
	);

	const divClassName = clsx('w-full');

	return (
		eventEntry
		&& (
			<>
				<form
					className={'w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 text-2xl'}
				>
					<div className={divClassName}>
						<LabeledInput
							id={'id'}
							value={
								eventEntry.id >= 0
									? eventEntry.id
									: 'To Be Determined'
							}
							disabled={true}
						>
							{'ID'}
						</LabeledInput>
					</div>

					<div className={divClassName}>
						<LabeledInput
							id={'createdAt'}
							value={eventEntry.createdAt}
							disabled={true}
						>
							{'Created At'}
						</LabeledInput>
					</div>

					<div className={divClassName}>
						<LabeledInput
							id={'title'}
							value={eventEntry.title}
							onChange={
								(e) => {

									setEventEntry({
										...eventEntry,
										title: e.target.value
									});

								}
							}
						>
							{'Title'}
						</LabeledInput>
					</div>

					<div className={divClassName}>
						<LabeledInput
							id={'location'}
							value={eventEntry.location}
							onChange={
								(e) => {

									setEventEntry({
										...eventEntry,
										location: e.target.value
									});

								}
							}
						>
							{'Location'}
						</LabeledInput>
					</div>

					<div
						className={divClassName}
					>
						<Label htmlFor={'datetime'}>
							{'Date/Time'}
						</Label>

						<DatePicker
							toggleCalendarOnIconClick
							showTimeInput
							className={'w-full'}
							id={'datetime'}
							dateFormat={'dd/MM/yyyy HH:mm'}
							timeIntervals={15}
							selected={new Date(eventEntry.dateTime)}
							onChange={
								(d) => {

									setEventEntry({
										...eventEntry,
										dateTime: d?.toISOString() || eventEntry.dateTime
									});

								}
							}
						/>
					</div>

					<div
						className={divClassName}
					>
						<LabeledCheckbox
							id={'enablePage'}
							checked={eventEntry.enablePage}
							onChange={
								(e) => {

									setEventEntry({
										...eventEntry,
										enablePage: e.target.checked
									});

								}
							}
						>
							{'Enable Page'}
						</LabeledCheckbox>
					</div>
				</form>

				{
					eventEntry.enablePage
					&& fileContent // Only allow editing of existing file (generated by server)
					&& (
						<div className={'w-full mt-5'}>

							<AdminMarkdownEditor
								value={fileContent}
								onChange={
									(str) => {

										setFileContent(str);

									}
								}
								onSave={
									() => {

										void saveEdit();

									}
								}
							/>
						</div>
					)
				}
			</>
		)
	);

};
