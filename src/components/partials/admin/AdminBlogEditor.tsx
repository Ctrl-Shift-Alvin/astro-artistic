import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState
} from 'react';
import { type z } from 'zod';
import { AdminMarkdownEditor } from './AdminMarkdownEditor';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import { ZProtectedPostApiRequestMap } from '@/components/types';
import {
	fetchBlogFile,
	fetchBlogIndex,
	newBlogFile,
	removeBlogFile,
	saveBlogFile
} from '@/frontend/adminApi';
import { A } from '@/components/elements/A';
import { Button } from '@/components/elements/Button';
import {
	disableUnloadConfirmation,
	enableUnloadConfirmation
} from '@/frontend/windowTools';

export const AdminBlogEditor = () => {

	const [
		showEditor,
		setShowEditor
	] = useState<boolean>(false);

	const [
		filesTable,
		setFilesTable
	] = useState<
		{
			fileName: string;
			isSelected: boolean;
		}[]
	>([]);
	const selectedFile = useMemo(
		() => {

			return filesTable.find((k) => k.isSelected);

		},
		[ filesTable ]
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

			if (fileContentChanged)
				enableUnloadConfirmation();
			else
				disableUnloadConfirmation();

		},
		[ fileContentChanged ]
	);

	const getIndex = useCallback(
		async() => {

			const blogIndex = await fetchBlogIndex();
			if (!blogIndex)
				return;

			setFilesTable(blogIndex.map((e) => ({
				fileName: e,
				isSelected: false
			})));

		},
		[]
	);
	const get = useCallback(
		async(fileName: string) => {

			const file = await fetchBlogFile(
				fileName,
				true
			);
			if (!file)
				return;

			setFileContent(file);
			setFileContentChanged(false);
			setShowEditor(true);

		},
		[ setFileContent ]
	);

	const selectFile = useCallback(
		async(fileName: string) => {

			// Did not save!
			if (selectedFile && fileContentChanged) {

				if (
					!await Dialog.yesNo(
						'File contents not saved',
						'Your currently open document was changed, but not saved.'
						+ 'Are you sure you want to continue and discard the changes?'
					)
				)
					return;
				setFileContentChanged(false);

			}

			// If selected item is selected again, then unselect
			if (selectedFile && fileName === selectedFile.fileName) {

				setFilesTable((prev) => prev.map((item) => {

					return item.fileName === fileName
						? {
							...item,
							isSelected: !item.isSelected
						}
						:	item;

				}));
				return;

			}

			// Hide editor, and show only when file is loaded
			setShowEditor(false);

			// Unselect former selected item, and select selected item
			setFilesTable((prev) => prev.map((item) => {

				return item.fileName === fileName
					? {
						...item,
						isSelected: true
					}
					: item.isSelected
						? {
							...item,
							isSelected: false
						}
						: item;

			}));

			await get(fileName);

		},
		[
			get,
			fileContentChanged,
			selectedFile
		]
	);

	const save = useCallback(
		async() => {

			if (!selectedFile?.fileName || !fileContent)
				return;

			if (!fileContentChanged) {

				Monolog.show({ text: 'The blog file is already saved in this state!' });

			} else if (
				await saveBlogFile(
					selectedFile.fileName,
					fileContent
				)
			) {

				setFileContentChanged(false);

			}

		},
		[
			fileContent,
			fileContentChanged,
			selectedFile
		]
	);
	const newFile = useCallback(
		async() => {

			type IFormValues = z.infer<typeof ZProtectedPostApiRequestMap['blog/new']>;

			const submitCallback = (formValues: IFormValues): boolean => {

				const parsed = ZProtectedPostApiRequestMap['blog/new'].safeParse(formValues);

				if (parsed.success) {

					return true;

				} else {

					switch (parsed.error.issues[0]?.code) {

						case 'invalid_format':
							Monolog.show({
								text: 'Error: Please only use the characters a-z, A-Z and 0-9, '
									+ 'aside from the optional .md at the end.'
							});
							break;
						case 'too_small':
							Monolog.show({ text: 'Error: Please enter a file name!' });
							break;
						case 'too_big':
							Monolog.show({ text: 'Error: The file name is too long!' });
							break;
						default:
							Monolog.show({ text: 'Error: Failed to parse file name!' });
							break;

					}
					return false;

				}

			};

			const form = (
				formValues: IFormValues,
				setFormValues: (newValues: IFormValues)=> void,
				onSubmit: (event: React.SyntheticEvent)=> void
			) => (

				/*
				 * Implicit submission, no submit button needed inside the form element:
				 * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission
				 */
				<form
					className={'flex flex-col'}
					onSubmit={onSubmit}
				>
					<label
						className={'text-white'}
						htmlFor={'fileName'}
					>
						{'File Name'}
					</label>

					<input
						className={'border-1 border-white text-white'}
						name={'fileName'}
						id={'fileName'}
						value={formValues.fileName}
						onChange={
							(e) => {

								setFormValues({ fileName: e.target.value });

							}
						}
					/>
				</form>
			);

			const dialogResult = await Dialog.form<IFormValues>(
				'New Blog Post',
				{
					body: form,
					onSubmit: submitCallback,
					initialValue: { fileName: '' }
				}
			);
			if (dialogResult === null)
				return;

			if (await newBlogFile(dialogResult.fileName)) {

				void getIndex();

			}

		},
		[ getIndex ]
	);
	const remove = useCallback(
		async() => {

			const fileName = selectedFile?.fileName;
			if (fileName === undefined)
				return;

			if (
				await removeBlogFile(
					fileName,
					true
				)
			) {

				// Deselect file and refresh index
				await selectFile(fileName);
				void getIndex();

			}

		},
		[
			getIndex,
			selectFile,
			selectedFile?.fileName
		]
	);

	useLayoutEffect(
		() => {

			void getIndex();

		},
		[ getIndex ]
	);

	return (
		<>
			<div className={'grid w-full grid-cols-1 md:grid-cols-[20%_80%]'}>
				<div>
					<table className={'w-full self-start border-2'}>
						<thead>
							<tr className={'border-b-2'}>
								<td className={'p-2 font-bold'}>
									{'File Name'}
								</td>
							</tr>
						</thead>

						<tbody>
							{
								filesTable.map((row) => (
									<tr key={row.fileName}>
										<td
											className={
												`${row.isSelected
													? 'font-bold'
													: ''} p-2`
											}
										>
											<A
												onClick={() => void selectFile(row.fileName)}
											>
												{row.fileName}
											</A>
										</td>
									</tr>
								))
							}

							<tr key={'addnew'}>
								<td className={'border-t-1 p-2'}>
									<A onClick={() => void newFile()}>
										{'+ New Post'}
									</A>
								</td>
							</tr>
						</tbody>
					</table>

					{
						selectedFile !== undefined && (
							<div className={'flex flex-row'}>
								<Button
									small={true}
									onClick={() => void remove()}
								>
									{'Remove'}
								</Button>

								<Button
									small={true}
									onClick={() => void save()}
								>
									{'Save'}
								</Button>
							</div>
						)
					}
				</div>

				{
					selectedFile !== undefined && showEditor && (
						<AdminMarkdownEditor
							value={fileContent}
							onChange={
								(v) => {

									setFileContent(v);
									setFileContentChanged(true);

								}
							}
							onSave={() => void save()}
						/>
					)
				}
			</div>
		</>
	);

};
