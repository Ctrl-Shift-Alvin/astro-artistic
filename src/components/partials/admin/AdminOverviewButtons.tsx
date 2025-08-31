import { Button } from '@/components/components/Button';
import { TActionPayload } from '@/shared/actions';

export const AdminOverviewButtons = ({ removeButtonPayload }: { removeButtonPayload?: TActionPayload }) => {

	const searchParams = new URLSearchParams(window.location.search);
	const prevUrl = searchParams.get('prevUrl');

	return (
		<div className={'w-full flex flex-row justify-evenly'}>

			<Button href={prevUrl ?? '/admin/home/'}>
				{'Back'}
			</Button>

			{
				removeButtonPayload && (
					<Button actionPayload={removeButtonPayload}>
						{'Remove'}
					</Button>
				)
			}

		</div>
	);

};
