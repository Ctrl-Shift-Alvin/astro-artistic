import {
	markdown,
	markdownLanguage
} from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { material } from '@uiw/codemirror-theme-material';
import ReactCodeMirror, { keymap } from '@uiw/react-codemirror';
import { marked } from 'marked';
import { useMemo } from 'react';

/**
 * A markdown editor for a string value.
 *
 * @param value The value that represents the editor contents.
 * @param onSave Called when the save action (Ctrl+S) is triggered.
 * @param onChange Called when the contents of the editor change. Make sure to manually update `value` here.
 */
export const AdminMarkdownEditor = ({
	value = '',
	onSave,
	onChange
}: {
	value?: string;
	onSave: (newValue: string)=> void;
	onChange: (newValue: string)=> void;
}) => {

	const editorKeymap = useMemo(
		() => keymap.of([
			{
				key: 'Ctrl-s',
				run: () => {

					onSave(value);
					return true;

				}
			}
		]),
		[
			onSave,
			value
		]
	);

	return (
		<div className={'w-full flex flex-col items-center'}>
			<div className={'w-full px-5'}>
				<ReactCodeMirror
					width={'100%'}
					height={'100%'}
					extensions={
						[
							markdown({
								base: markdownLanguage,
								codeLanguages: languages
							}),
							editorKeymap
						]
					}
					theme={material}
					value={value}
					onChange={
						(v) => {

							onChange(v);

						}
					}
				/>
			</div>

			<div className={'prose prose-invert prose-img:rounded-lg w-full mt-8'}>
				<article
					dangerouslySetInnerHTML={
						{
							__html: marked.parse(value
								.split('-')
								.at(-1) ?? '')
						}
					}
					className={'border-2 p-5'}
				/>
			</div>

		</div>
	);

};
