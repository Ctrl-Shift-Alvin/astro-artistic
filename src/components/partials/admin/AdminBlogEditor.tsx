import {
	useLayoutEffect, useState
} from 'react';
import { type z } from 'zod';
import { AdminMarkdownEditor } from './AdminMarkdownEditor';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import { ZProtectedPostApiRequestMap } from '@/components/types';
import {
	fetchBlogFile, fetchBlogIndex,
	newBlogFile,
	removeBlogFile,
	saveBlogFile
} from '@/frontend/adminTools';
import { A } from '@/components/components/A';
import { Button } from '@/components/components/Button';

export const AdminBlogEditor = () => {

	const [
		hideEditor,
		setHideEditor
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

	const [
		fileContent,
		setFileContent
	] = useState<string>('');

	const [
		fileContentChanged,
		setFileContentChanged
	] = useState<boolean>(false);

	const selectFile = async(fileName: string) => {

		// Did not save!
		if (fileContentChanged) {

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
		if (fileName === getSelected()?.fileName) {

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

		setHideEditor(true);

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

	};
	const getSelected = () => filesTable.find((k) => k.isSelected);

	const getIndex = async() => {

		const blogIndex = await fetchBlogIndex();
		if (!blogIndex)
			throw new Error('Failed to fetch blog index.');

		setFilesTable(blogIndex.map((e) => ({
			fileName: e,
			isSelected: false
		})));

	};
	const get = async(fileName: string) => {

		const file = await fetchBlogFile(fileName);
		if (file === null) {

			Monolog.show({ text: 'Failed to fetch blog file!' });
			return;

		}

		setFileContent(file);
		setFileContentChanged(false);
		setHideEditor(false);

	};
	const save = async() => {

		const fileName = getSelected()?.fileName;
		if (!fileName)
			return;

		const status = await saveBlogFile(
			fileName,
			fileContent
		);

		if (status) {

			setFileContentChanged(false);
			Monolog.show({
				text: 'File saved successfully!',
				durationMs: 2000
			});

		} else {

			Monolog.show({
				text: 'Couldn\'t save the file!',
				durationMs: 5000
			});

		}

	};
	const newFile = async() => {

		type IFormValues = z.infer<typeof ZProtectedPostApiRequestMap['blog/new']>;

		const form = (
			formValues: IFormValues,
			setFormValues: (newValues: IFormValues)=> void
		) => (
			<form className={'flex flex-col'}>
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

		} else {

			Monolog.show({ text: 'Failed to create new file!' });

		}

	};
	const remove = async() => {

		const fileName = getSelected()?.fileName;
		if (fileName === undefined)
			return;
		if (
			!await Dialog.yesNo(
				'Remove Blog Post File',
				`Removing the file '${fileName}' cannot be reverted. Are you sure you want to continue?`
			)
		)
			return;

		if (await removeBlogFile(fileName)) {

			await selectFile(fileName);
			void getIndex();

		} else {

			Monolog.show({
				text: 'Couldn\'t remove the file.',
				durationMs: 5000
			});

		}

	};

	useLayoutEffect(
		() => {

			void getIndex();

		},
		[]
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
						getSelected() !== undefined && (
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
					getSelected() && !hideEditor && (
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
