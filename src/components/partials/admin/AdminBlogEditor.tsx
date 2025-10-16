import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useState
} from 'react';
import { AdminMarkdownEditor } from './AdminMarkdownEditor';
import { addAdminButton } from './AdminButtonContainer';
import { Monolog } from '@/components/components/MonologProvider';
import {
	fetchBlogFile,
	removeBlogFile,
	saveBlogFile
} from '@/frontend/adminApi';
import {
	disableUnloadConfirmation,
	enableUnloadConfirmation
} from '@/frontend/windowTools';

/**
 * An editor for a blog file, that works through the protected admin API.
 */
export const AdminBlogEditor = ({ fileName }: { fileName: string }) => {

	const [
		showEditor,
		setShowEditor
	] = useState<boolean>(false);

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

			_setFileContent(
				(prev) => {

					if (prev) {

						setFileContentChanged(true);

					}
					return value;

				}
			);

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

	const save = useCallback(
		async() => {

			if (!fileContent)
				return;

			if (!fileContentChanged) {

				Monolog.show({ text: 'The blog file is already saved in this state!' });

			} else if (
				await saveBlogFile(
					fileName,
					fileContent
				)
			) {

				setFileContentChanged(false);

			}

		},
		[
			fileContent,
			fileContentChanged,
			fileName
		]
	);
	const remove = useCallback(
		async() => {

			await removeBlogFile(
				fileName,
				true
			);

		},
		[ fileName ]
	);

	useLayoutEffect(
		() => {

			const get = async() => {

				const result = await fetchBlogFile(
					fileName,
					true
				);
				if (!result)
					return;

				_setFileContent(result);
				setFileContentChanged(false);
				setShowEditor(true);

			};

			void get();

		},
		[ fileName ]
	);

	useLayoutEffect(
		() => {

			addAdminButton(
				{
					children: 'Save',
					onClick: () => void save()
				},
				{
					children: 'Remove',
					onClick: () => void remove()
				}
			);

		},
		[
			remove,
			save
		]
	);

	return (
		<>
			<div className={'w-full'}>

				{
					showEditor && (
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
