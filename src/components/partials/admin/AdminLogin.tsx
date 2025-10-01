import { useState } from 'react';
import { Button } from '@/components/elements/Button';
import { login } from '@/frontend/adminApi';
import { LabeledInput } from '@/components/elements/LabeledInput';

/**
 * The login form for the admin page. Tries to authenticate the client to the admin protected API.
 */
export const AdminLogin = () => {

	const [
		password,
		setPassword
	] = useState<string>('');

	return (
		<>
			<h1 className={'mb-8 text-3xl font-bold'}>
				{'Login'}
			</h1>

			<form
				id={'authForm'}
				name={'authForm'}
				onSubmit={
					(e: React.FormEvent) => {

						e.preventDefault();

						void login(password);

					}
				}
			>
				<div className={'gap-y-6'}>
					<div className={'border-b border-gray-600/40 pb-12'}>
						<div className={'mt-10 gap-x-6 gap-y-8 sm:grid-cols-6'}>
							<LabeledInput
								id={'password'}
								name={'password'}
								type={'password'}
								value={password}
								onChange={
									(e) => {

										setPassword(e.target.value);

									}
								}
							>
								{'Password'}
							</LabeledInput>
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

};
