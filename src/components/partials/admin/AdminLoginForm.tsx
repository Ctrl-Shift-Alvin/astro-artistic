import { Button } from '@/components/components/Button';
import {
	checkLogin,
	handleAuthSubmit
} from '@/frontend/protectedApi';
import { goto } from '@/frontend/windowTools';

export const AdminLoginForm = () => (
	<>
		<h1 className={'mb-8 text-3xl font-bold'}>
			{'Login'}
		</h1>

		<form
			id={'authForm'}
			name={'authForm'}
			onSubmit={
				(e: React.FormEvent) => {

					void handleAuthSubmit(e.nativeEvent).then(() => {

						if (checkLogin()) {

							goto('/admin/home/');

						}

					});

				}
			}
		>
			<div className={'gap-y-6'}>
				<div className={'border-b border-gray-600/40 pb-12'}>
					<div className={'mt-10 gap-x-6 gap-y-8 sm:grid-cols-6'}>
						<div className={'sm:col-span-3'}>
							<label
								htmlFor={'password'}
								className={'text-sm/6 font-medium text-white'}
							>
								{'Password'}
							</label>

							<div className={'mt-2'}>
								<input
									id={'password'}
									name={'password'}
									type={'password'}
									className={'w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={'mt-6 flex items-center justify-end gap-x-6'}>
				<Button type={'submit'}>
					{'Login'}
				</Button>
			</div>
		</form>
	</>
);
