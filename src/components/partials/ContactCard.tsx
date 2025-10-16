import { useState } from 'react';
import clsx from 'clsx';
import { Monolog } from '../components/MonologProvider';
import { ZContactApiRequest } from '../types';
import { A } from '../elements/A';
import { Button } from '../elements/Button';
import { LabeledInput } from '../elements/LabeledInput';
import { LabeledTextArea } from '../elements/LabeledTextArea';
import { CaptchaSolver } from '../components/CaptchaSolver';
import { type TContact } from '@/shared/config/configTypes';
import {
	addCaptchaAttempt,
	fetchNewCaptcha,
	getCaptcha
} from '@/frontend/captchaApi';

/**
 * A card that allows users to submit a contact form using the contact API.
 */
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
		captchaData,
		setCaptchaData
	] = useState('');

	const handleSubmit = async(e: React.FormEvent) => {

		e.preventDefault();

		const requestBody = ZContactApiRequest.safeParse({
			data: { ...formData },
			captcha: {
				id: (await getCaptcha())?.id,
				text: captchaData
			}
		});
		if (!requestBody.success) {

			switch (
				requestBody
					.error
					.issues[0]
					?.path[1]
			) {

				case 'email': {

					Monolog.show({
						text: window
							.__TRANSLATION__
							.contact
							.feedback
							.emailError
					});

				} break;
				case 'phoneNumber': {

					Monolog.show({
						text: window
							.__TRANSLATION__
							.contact
							.feedback
							.phoneNumberError
					});

				} break;
				case undefined: {

					Monolog.show({
						text: window
							.__TRANSLATION__
							.contact
							.feedback
							.sendingError
					});

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

		addCaptchaAttempt();

		if (response.ok) {

			void fetchNewCaptcha();
			Monolog.show({
				text: window
					.__TRANSLATION__
					.contact
					.feedback
					.noError
			});

		} else if (response.status === 401) {

			Monolog.show({
				text: window
					.__TRANSLATION__
					.captcha
					.errorFeedback
			});

		} else if (response.status === 409) {

			void fetchNewCaptcha();
			Monolog.show({
				text: window
					.__TRANSLATION__
					.contact
					.feedback
					.duplicateError
			});

		} else {

			Monolog.show({
				text: window
					.__TRANSLATION__
					.contact
					.feedback
					.sendingError
			});

		}

	};

	return (
		<>
			<div
				className={
					clsx(
						'flex flex-col items-center sm:justify-between md:gap-x-24',
						alternate ?? false
							? 'lg:flex-row-reverse'
							: 'lg:flex-row'
					)
				}
			>
				<div>
					<p
						className={
							clsx(
								'text-center newlines text-xl leading-9',
								alternate ?? false
									? 'lg:text-right'
									: 'lg:text-left'
							)
						}
					>
						{contactData.description}
					</p>

					<p
						className={
							clsx(
								'text-center text-xl leading-9',
								alternate ?? false
									? 'lg:text-right'
									: 'lg:text-left'
							)
						}
					>
						{window
							.__TRANSLATION__
							.contact
							.email}

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
							clsx(
								'mb-4 text-center text-xl leading-9',
								alternate ?? false
									? 'lg:text-right'
									: 'lg:text-left'
							)
						}
					>
						{window
							.__TRANSLATION__
							.contact
							.phoneNumber}

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
										<LabeledInput
											required
											id={'first-name'}
											name={'first-name'}
											type={'text'}
											autoComplete={'given-name'}
											value={formData.firstName}
											onChange={
												(e) => {

													setFormData({
														...formData,
														firstName: e.target.value
													});

												}
											}
										>
											{window
												.__TRANSLATION__
												.contact
												.firstName}
										</LabeledInput>
									</div>

									<div className={'sm:col-span-3'}>
										<LabeledInput
											required
											id={'last-name'}
											name={'last-name'}
											type={'text'}
											autoComplete={'family-name'}
											value={formData.lastName}
											onChange={
												(e) => {

													setFormData({
														...formData,
														lastName: e.target.value
													});

												}
											}
										>
											{window
												.__TRANSLATION__
												.contact
												.lastName}
										</LabeledInput>
									</div>

									<div className={'sm:col-span-3'}>
										<LabeledInput
											required
											id={'email'}
											name={'email'}
											type={'text'}
											autoComplete={'email'}
											value={formData.email}
											onChange={
												(e) => {

													setFormData({
														...formData,
														email: e.target.value
													});

												}
											}
										>
											{window
												.__TRANSLATION__
												.contact
												.email}
										</LabeledInput>
									</div>

									<div className={'sm:col-span-3'}>
										<LabeledInput
											required
											id={'phone-number'}
											name={'phone-number'}
											type={'text'}
											autoComplete={'tel'}
											value={formData.phoneNumber}
											onChange={
												(e) => {

													setFormData({
														...formData,
														phoneNumber: e
															.target
															.value
															.startsWith('00') // Replace 00 with +
															? `+${e
																.target
																.value
																.slice(2)
																.replace(
																	/\s/g,
																	''
																)}`
															: e
																.target
																.value
																.startsWith('0') // Replace first 0 with default code
																? `+43${e
																	.target
																	.value
																	.slice(1)
																	.replace(
																		/\s/g,
																		''
																	)}`
																: e
																	.target
																	.value
																	.replace(
																		/\s/g,
																		''
																	)
													});

												}
											}
										>
											{window
												.__TRANSLATION__
												.contact
												.phoneNumber}
										</LabeledInput>
									</div>

									<div className={'col-span-full'}>
										<div className={'mt-2'}>
											<LabeledTextArea
												id={'message'}
												name={'message'}
												rows={3}
												value={formData.message}
												onChange={
													(e) => {

														setFormData({
															...formData,
															message: e.target.value
														});

													}
												}
											>
												{window
													.__TRANSLATION__
													.contact
													.message}
											</LabeledTextArea>
										</div>
									</div>

									<div className={'sm:col-span-3'}>
										<CaptchaSolver
											value={captchaData}
											setValue={setCaptchaData}
										/>
									</div>
								</div>
							</div>
						</div>

						<div className={'mt-6 flex justify-center gap-x-6 sm:justify-end'}>
							<Button type={'submit'}>
								{window
									.__TRANSLATION__
									.contact
									.submit}
							</Button>
						</div>
					</form>
				)
			}
		</>
	);

};
