import { useState } from 'react';
import clsx from 'clsx';
import { Monolog } from '../components/MonologProvider';
import { ZContactFormSubmission } from '../types';
import { A } from '../components/A';
import { Button } from '../components/Button';
import { type TContact } from '@/shared/config/configTypes';

export const ContactCard = ({
	alternate,
	enableContactForm = true,
	contactData
}: {
	alternate?: boolean;
	enableContactForm?: boolean;
	contactData: TContact;
}) => {

	const [
		formData,
		setFormData
	] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phoneNumber: '',
		message: ''
	});
	const [
		submitted,
		setSubmitted
	] = useState(false);

	const handleSubmit = async(e: React.FormEvent) => {

		e.preventDefault();

		if (submitted) {

			setSubmitted(false);
			Monolog.show({ text: window.__TRANSLATION__.contact.feedback.resendError });
			return;

		}

		const requestBody = ZContactFormSubmission.safeParse(formData);
		if (!requestBody.success) {

			switch (requestBody.error.issues[0]?.path[0]) {

				case 'firstName': {

					Monolog.show({ text: window.__TRANSLATION__.contact.feedback.nameError });

				} break;
				case 'lastName': {

					Monolog.show({ text: window.__TRANSLATION__.contact.feedback.nameError });

				} break;
				case 'email': {

					Monolog.show({ text: window.__TRANSLATION__.contact.feedback.emailError });

				} break;
				case 'phoneNumber': {

					Monolog.show({ text: window.__TRANSLATION__.contact.feedback.phoneNumberError });

				} break;
				case 'message': {

					Monolog.show({ text: window.__TRANSLATION__.contact.feedback.messageError });

				} break;
				default: {

					Monolog.show({ text: window.__TRANSLATION__.contact.feedback.sendingError });

				} break;

			}
			return;

		}

		const response = await fetch(
			'/api/contact/',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(requestBody.data)
			}
		);
		if (response.ok) {

			setSubmitted(true);
			Monolog.show({ text: window.__TRANSLATION__.contact.feedback.noError });

		} else if (response.status === 409) {

			Monolog.show({ text: window.__TRANSLATION__.contact.feedback.duplicateError });

		} else {

			Monolog.show({ text: window.__TRANSLATION__.contact.feedback.sendingError });

		}

	};

	const inputClassName = clsx(
		'block w-full rounded-md bg-gray-800 px-3 py-1.5 text-base text-white',
		'outline-1 outline-gray-300 focus:outline-2 focus:outline-indigo-600 sm:text-sm/6'
	);

	return (
		<>
			<div
				className={
					`flex flex-col items-center ${
						alternate
							? 'lg:flex-row-reverse'
							: 'lg:flex-row'
					} sm:justify-between md:gap-x-24`
				}
			>
				<div>

					<p
						className={
							`text-center ${alternate
								? 'lg:text-right'
								: 'lg:text-left'} newlines text-xl leading-9`
						}
					>
						{contactData.description}
					</p>

					<p
						className={
							`text-center ${alternate
								? 'lg:text-right'
								: 'lg:text-left'} text-xl leading-9`
						}
					>
						{window.__TRANSLATION__.contact.email}
						{':'}
						{' '}

						<A
							href={`mailto:${contactData.email}`}
							target={'_blank'}
						>
							{contactData.email}
						</A>
					</p>

					<p
						className={
							`mb-4 text-center ${alternate
								? 'lg:text-right'
								: 'lg:text-left'} text-xl leading-9`
						}
					>
						{window.__TRANSLATION__.contact.phoneNumber}
						{':'}
						{' '}

						<A
							href={`tel:${contactData.telNumber}`}
							target={'_blank'}
						>
							{contactData.telNumber}
						</A>
					</p>

				</div>
			</div>

			{
				enableContactForm && (
					<form onSubmit={(e) => void handleSubmit(e)}>
						<div className={'gap-y-6'}>
							<div className={'border-b border-gray-600/40 pb-12'}>
								<div className={'mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6'}>
									<div className={'sm:col-span-3'}>
										<label
											htmlFor={'first-name'}
											className={'block text-sm/6 font-medium text-white'}
										>
											{window.__TRANSLATION__.contact.firstName}
										</label>

										<div className={'mt-2'}>
											<input
												id={'first-name'}
												name={'first-name'}
												type={'text'}
												autoComplete={'given-name'}
												className={inputClassName}
												value={formData.firstName}
												onChange={
													(e) => {

														setFormData({
															...formData,
															firstName: e.target.value
														});

													}
												}
											/>
										</div>
									</div>

									<div className={'sm:col-span-3'}>
										<label
											htmlFor={'last-name'}
											className={'block text-sm/6 font-medium text-white'}
										>
											{window.__TRANSLATION__.contact.lastName}
										</label>

										<div className={'mt-2'}>
											<input
												id={'last-name'}
												name={'last-name'}
												type={'text'}
												autoComplete={'family-name'}
												className={inputClassName}
												value={formData.lastName}
												onChange={
													(e) => {

														setFormData({
															...formData,
															lastName: e.target.value
														});

													}
												}
											/>
										</div>
									</div>

									<div className={'sm:col-span-3'}>
										<label
											htmlFor={'email'}
											className={'block text-sm/6 font-medium text-white'}
										>
											{window.__TRANSLATION__.contact.email}
										</label>

										<div className={'mt-2'}>
											<input
												id={'email'}
												name={'email'}
												type={'text'}
												autoComplete={'email'}
												className={inputClassName}
												value={formData.email}
												onChange={
													(e) => {

														setFormData({
															...formData,
															email: e.target.value
														});

													}
												}
											/>
										</div>
									</div>

									<div className={'sm:col-span-3'}>
										<label
											htmlFor={'phone-number'}
											className={'block text-sm/6 font-medium text-white'}
										>
											{window.__TRANSLATION__.contact.phoneNumber}
										</label>

										<div className={'mt-2'}>
											<input
												id={'phone-number'}
												name={'phone-number'}
												type={'text'}
												autoComplete={'tel'}
												className={inputClassName}
												value={formData.phoneNumber}
												onChange={
													(e) => {

														setFormData({
															...formData,
															phoneNumber: e.target.value.startsWith('00') // Replace 00 with +
																? `+${e.target.value
																	.slice(2)
																	.replace(
																		/\s/g,
																		''
																	)}`
																: e.target.value.startsWith('0') // Replace first 0 with default code
																	? `+43${e.target.value
																		.slice(1)
																		.replace(
																			/\s/g,
																			''
																		)}`
																	: e.target.value.replace(
																		/\s/g,
																		''
																	)
														});

													}
												}
											/>
										</div>
									</div>

									<div className={'col-span-full'}>
										<label
											htmlFor={'message'}
											className={'block text-sm/6 font-medium text-white'}
										>
											{window.__TRANSLATION__.contact.message}
										</label>

										<div className={'mt-2'}>
											<textarea
												id={'message'}
												name={'message'}
												rows={3}
												className={inputClassName}
												value={formData.message}
												onChange={
													(e) => {

														setFormData({
															...formData,
															message: e.target.value
														});

													}
												}
											/>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div className={'mt-6 flex justify-center gap-x-6 sm:justify-end'}>
							<Button type={'submit'}>
								{window.__TRANSLATION__.contact.submit}
							</Button>
						</div>
					</form>
				)
			}
		</>
	);

};
