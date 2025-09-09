import {
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react';
import clsx from 'clsx/lite';
import { DatePicker } from 'react-datepicker';
import { AdminMarkdownEditor } from './AdminMarkdownEditor';
import { Monolog } from '@/components/components/MonologProvider';
import { type TEventsEntry } from '@/components/types';
import {
	editEventsEntry,
	getEvent,
	saveEvent
} from '@/frontend/protectedApi';

// eslint-disable-next-line import-x/no-unassigned-import
import 'react-datepicker/dist/react-datepicker.css';

export const AdminEventsEditor = ({ eventId }: { eventId: number }) => {

	const isInitialMount = useRef(true);

	const [
		eventEntry,
		setEventEntry
	] = useState<TEventsEntry>();
	const [
		eventEntryChanged,
		setEventEntryChanged
	] = useState<boolean>(false);
	useEffect(
		() => {

			if (isInitialMount.current) {

				isInitialMount.current = false;

			} else {

				setEventEntryChanged(true);

			}

		},
		[ eventEntry ]
	);

	const [
		fileContent,
		setFileContent
	] = useState<string>();
	const [
		fileContentChanged,
		setFileContentChanged
	] = useState<boolean>(false);
	useEffect(
		() => {

			if (isInitialMount.current) {

				isInitialMount.current = false;

			} else {

				setFileContentChanged(true);

			}

		},
		[ fileContent ]
	);

	const get = useCallback(
		async() => {

			const result = await getEvent(eventId);
			if (result === null) {

				Monolog.show({ text: `Failed to fetch event entry with ID '${eventId}'!` });
				return;

			}

			setEventEntry(result.data);

			if (result.file)
				setFileContent(result.file);

		},
		[ eventId ]
	);
	const edit = useCallback(
		async(): Promise<boolean> => {

			if (!eventEntry) {

				Monolog.show({
					text: 'Failed to edit event entry, values undefined!',
					durationMs: 3000
				});
				return false;

			}
			const result = await editEventsEntry(
				eventId,
				eventEntry
			);

			if (result) {

				setEventEntryChanged(false);

			}

			return result;

		},
		[
			eventEntry,
			eventId
		]
	);
	const save = useCallback(
		async(): Promise<boolean> => {

			if (!fileContent) {

				Monolog.show({
					text: 'Failed to save event entry content, file contents undefined!',
					durationMs: 3000
				});
				return false;

			}
			const result = await saveEvent(
				eventId,
				fileContent
			);

			if (result) {

				setFileContentChanged(false);

			}

			return result;

		},
		[
			eventId,
			fileContent
		]
	);
	const saveEdit = useCallback(
		async() => {

			const promises = new Array<Promise<boolean>>();
			if (eventEntryChanged) {

				promises.push(edit());

			}

			if (fileContentChanged && eventEntry?.enablePage) {

				promises.push(save());

			}

			if (promises.length === 0) {

				Monolog.show({ text: 'No changes made!' });
				return;

			}

			const results = await Promise.all(promises);

			if (results.every((i) => i)) {

				Monolog.show({
					text: `Successfully saved the event entry${results.length > 1
						? ' and entry contents'
						: ''}!`
				});

			} else if (results[0] === true) {

				Monolog.show({ text: 'Successfully saved the event entry!' });

			} else if (results[1] === true) {

				Monolog.show({ text: 'Successfully saved the event entry contents!' });

			}

		},
		[
			eventEntryChanged,
			fileContentChanged,
			eventEntry,
			edit,
			save
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

				<div className={'w-full flex justify-center mt-5'}>
					<Button onClick={() => void saveEdit()}>
						{'Save'}
					</Button>
				</div>

				{
					eventEntry.enablePage
					&& (
						<div className={'w-full mt-5'}>

							<AdminMarkdownEditor
								value={fileContent}
								onChange={
									(str) => {

										setFileContent(str);
										setFileContentChanged(true);

									}
								}
								onSave={() => void saveEdit()}
							/>
						</div>
					)
				}
			</>
		)
	);

};
