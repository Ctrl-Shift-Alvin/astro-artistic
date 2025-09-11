import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useState
} from 'react';
import clsx from 'clsx/lite';
import { DatePicker } from 'react-datepicker';
import { AdminMarkdownEditor } from './AdminMarkdownEditor';
import { addAdminButton } from './AdminButtonContainer';
import { Monolog } from '@/components/components/MonologProvider';
import { type TEventsEntry } from '@/components/types';
import {
	deleteEvent,
	editEvent,
	getEvent,
	saveEvent
} from '@/frontend/adminApi';

// eslint-disable-next-line import-x/no-unassigned-import
import 'react-datepicker/dist/react-datepicker.css';

export const AdminEventsEditor = ({ eventId }: { eventId: number }) => {

	const [
		eventEntry,
		_setEventEntry
	] = useState<TEventsEntry>();
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

	const get = useCallback(
		async() => {

			const result = await getEvent(
				eventId,
				true
			);
			if (!result)
				return;

			setEventEntry(result.data);

			if (result.file)
				setFileContent(result.file);

		},
		[
			eventId,
			setEventEntry,
			setFileContent
		]
	);
	const edit = useCallback(
		async() => {

			if (!eventEntry)
				return;

			if (
				await editEvent(
					eventId,
					eventEntry
				)
			) {

				setEventEntryChanged(false);

			}

		},
		[
			eventEntry,
			eventId
		]
	);
	const save = useCallback(
		async() => {

			if (!fileContent)
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
		() => {

			if (eventEntryChanged) {

				void edit();

			}
			if (fileContentChanged) {

				void save();

			}

			if (!eventEntryChanged && !fileContentChanged) {

				Monolog.show({ text: 'No changes made!' });
				return;

			}

		},
		[
			eventEntryChanged,
			fileContentChanged,
			edit,
			save
		]
	);

	useLayoutEffect(
		() => {

			addAdminButton(
				{
					children: 'Save',
					onClick: saveEdit
				},
				{
					children: 'Delete',
					onClick: () => void deleteEvent(
						eventId,
						true
					)
				}
			);

		},
		[
			eventId,
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
	const labelClassName = clsx('w-full pr-4 text-white font-bold text-center sm:text-left');
	const inputClassName = clsx('w-full border-1 border-white text-white');

	return (
		eventEntry
		&& (
			<>
				<form
					className={'w-full grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8 text-2xl'}
				>
					<div className={divClassName}>
						<label
							htmlFor={'id'}
							className={labelClassName}
						>
							{'ID'}
						</label>

						<input
							id={'id'}
							className={inputClassName}
							value={eventEntry.id}
							disabled={true}
						/>
					</div>

					<div className={divClassName}>
						<label
							htmlFor={'createdAt'}
							className={labelClassName}
						>
							{'Created At'}
						</label>

						<input
							id={'createdAt'}
							className={inputClassName}
							value={eventEntry.createdAt}
							disabled={true}
						/>
					</div>

					<div className={divClassName}>
						<label
							htmlFor={'title'}
							className={labelClassName}
						>
							{'Title'}
						</label>

						<input
							id={'title'}
							className={inputClassName}
							value={eventEntry.title}
							onChange={
								(e) => {

									setEventEntry({
										...eventEntry,
										title: e.target.value
									});

								}
							}
						/>
					</div>

					<div className={divClassName}>
						<label
							htmlFor={'location'}
							className={labelClassName}
						>
							{'Location'}
						</label>

						<input
							id={'location'}
							className={inputClassName}
							value={eventEntry.location}
							onChange={
								(e) => {

									setEventEntry({
										...eventEntry,
										location: e.target.value
									});

								}
							}
						/>
					</div>

					<div
						className={divClassName}
					>
						<label
							htmlFor={'datetime'}
							className={labelClassName}
						>
							{'Date/Time'}
						</label>

						<DatePicker
							showIcon
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
						<label
							htmlFor={'enablePage'}
							className={labelClassName.without('sm:text-left')}
						>
							{'Enable Page'}
						</label>

						<input
							id={'enablePage'}
							type={'checkbox'}
							checked={eventEntry.enablePage}
							className={'size-5 mx-auto'}
							onChange={
								(e) => {

									setEventEntry({
										...eventEntry,
										enablePage: e.target.checked
									});

								}
							}
						/>
					</div>
				</form>

				{
					eventEntry.enablePage
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

										saveEdit();

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
