import { useState } from 'react';
import clsx from 'clsx';
import { Button } from '@/components/elements/Button';
import { login } from '@/frontend/adminApi';

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
										className={
											clsx(
												'w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white sm:text-sm/6',
												'outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600'
											)
										}
										value={password}
										onChange={
											(e) => {

												setPassword(e.target.value);

											}
										}
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

};
