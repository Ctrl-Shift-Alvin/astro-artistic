import {
	markdown,
	markdownLanguage
} from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { material } from '@uiw/codemirror-theme-material';
import ReactCodeMirror, { keymap } from '@uiw/react-codemirror';
import { marked } from 'marked';

export const AdminMarkdownEditor = ({
	value = '',
	onSave,
	onChange
}: {
	value: string;
	onSave: (newValue: string)=> void;
	onChange: (newValue: string)=> void;
}) => {

	const editorKeymap = keymap.of([
		{
			key: 'Ctrl-s',
			run: () => {

				onSave(value);
				return true;

			}
		}
	]);

	return (
		<div className={'w-full flex flex-col items-center'}>
			<div className={'w-full px-5'}>
				<ReactCodeMirror
					width={'100%'}
					height={'100%'}
					extensions={[
						markdown({
							base: markdownLanguage,
							codeLanguages: languages
						}),
						editorKeymap
					]}
					theme={material}
					value={value}
					onChange={(v) => {

						onChange(v);

					}}
				/>
			</div>

			<div className={'prose prose-invert prose-img:rounded-lg w-full mt-8'}>
				<article
					dangerouslySetInnerHTML={{
						__html: marked.parse(value
							.split('-')
							.at(-1) ?? '')
					}}
					className={'border-2 p-5'}
				/>
			</div>

		</div>
	);

};
