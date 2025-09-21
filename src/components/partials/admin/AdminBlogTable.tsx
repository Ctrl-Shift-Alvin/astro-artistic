import {
	useState,
	useCallback,
	useMemo,
	useLayoutEffect
} from 'react';
import clsx from 'clsx/lite';
import z from 'zod';
import { BlogConfig } from '@/shared/config/blog';
import {
	fetchBlogCount,
	fetchBlogIndex,
	newBlogFile,
	removeBlogFile
} from '@/frontend/adminApi';
import { A } from '@/components/elements/A';
import { Dialog } from '@/components/components/DialogProvider';
import { Monolog } from '@/components/components/MonologProvider';
import { LabeledInput } from '@/components/elements/LabeledInput';
import { ZProtectedPostApiRequestMap } from '@/components/types';
import { Button } from '@/components/elements/Button';

export const AdminBlogTable = () => {

	const tableInitialEntryCount = useMemo(
		() => BlogConfig(window.__TRANSLATION__).tableInitialEntryCount,
		[]
	);

	const [
		blogIndex,
		setBlogIndex
	] = useState<string[]>([]);

	const [
		fullIndexCount,
		setFullIndexCount
	] = useState(0);

	const [
		blogCount,
		setBlogCount
	] = useState(tableInitialEntryCount);

	const index = useCallback(
		async(count: number) => {

			/*
			 * Because of semi-circular deps, when 'Show more...' is clicked, this is called twice.
			 * A simple check if something has changed prevents an API request.
			 */
			if (count == blogIndex.length)
				return;

			// If count decreased, just slice the builds index
			if (blogIndex.length >= count) {

				setBlogIndex((prev) => prev.slice(
					0,
					count
				));
				return;

			}

			// Otherwise, fetch only missing rows
			const result = await fetchBlogIndex(
				count - blogIndex.length,
				blogIndex.length
			);
			if (result === null)
				return;

			setBlogIndex((prev) => [
				...prev,
				...result
			].slice(
				0,
				blogCount
			));

		},
		[
			blogCount,
			blogIndex.length
		]
	);
	const count = useCallback(
		async() => {

			const result = await fetchBlogCount();
			if (result) {

				setFullIndexCount(result);

			}

		},
		[]
	);
	const remove = useCallback(
		async(fileName: string) => {

			await removeBlogFile(fileName);

			// Refetch all entries up to current count
			setBlogIndex([]);
			void count();

			if (blogCount > fullIndexCount)
				setBlogCount(fullIndexCount);

			void index(blogCount);

		},
		[
			blogCount,
			count,
			fullIndexCount,
			index
		]
	);
	const add = useCallback(
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
					<LabeledInput
						name={'fileName'}
						id={'fileName'}
						value={formValues.fileName}
						onChange={
							(e) => {

								setFormValues({ fileName: e.target.value });

							}
						}
					>
						{'File Name'}
					</LabeledInput>
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

			await newBlogFile(dialogResult.fileName);

			// Refetch all entries up to current count
			setBlogIndex([]);
			void count();
			void index(blogCount);

		},
		[
			blogCount,
			count,
			index
		]
	);

	const increaseCount = useCallback(
		() => {

			setBlogCount((prev) => prev + tableInitialEntryCount);

		},
		[ tableInitialEntryCount ]
	);
	const decreaseCount = useCallback(
		() => {

			setBlogCount((prev) => prev - tableInitialEntryCount);

		},
		[ tableInitialEntryCount ]
	);

	useLayoutEffect(
		() => {

			void count();
			void index(blogCount);

		},
		[
			index,
			count,
			blogCount
		]
	);

	return (
		<>
			<table className={'w-4/6 border-collapse border border-gray-300'}>
				<thead>
					<tr>
						<td className={'border p-2 font-bold'}>
							{'File Name'}
						</td>

						<td className={'border p-2 font-bold'}>
							{'D'}
						</td>
					</tr>
				</thead>

				<tbody>
					{
						blogIndex.map((entry) => {

							const tdClassName = clsx('border p-2');
							return (
								<tr key={entry}>

									<td className={tdClassName}>
										<A
											href={`/admin/blogs/${entry}/?prevUrl=${encodeURIComponent(window.location.pathname)}`}
											className={'underline'}
										>
											{entry}
										</A>
									</td>

									<td className={tdClassName}>
										<A
											className={'text-red-600'}
											onClick={() => void remove(entry)}
										>
											{'D'}
										</A>
									</td>
								</tr>
							);

						})
					}
				</tbody>
			</table>

			{
				blogCount >= tableInitialEntryCount * 2
				&& (
					<A
						onClick={
							() => {

								decreaseCount();

							}
						}
					>
						{'Show less...'}
					</A>
				)
			}

			{
				fullIndexCount > blogCount
				&& (
					<A
						onClick={
							() => {

								increaseCount();

							}
						}
					>
						{'Show more...'}
					</A>
				)
			}

			<div className={'flex w-full mt-2 flex-row justify-evenly'}>
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
