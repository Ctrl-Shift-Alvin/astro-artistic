import { useEffect } from 'react';
import { Button } from '@/components/components/Button';
import { Monolog } from '@/components/components/MonologProvider';
import {
	logout,
	setLogoutCallback,
	setLogoutTimeout
} from '@/frontend/adminTools';
import { goto } from '@/frontend/windowTools';

export const AdminLogout = () => {

	useEffect(
		() => {

			setLogoutCallback(() => {

				document
					.getElementById('content-div')
					?.childNodes.forEach((v) => {

						v.remove();

					});

				Monolog.show({
					text: 'Logged out: Token expired, please log in again!',
					durationMs: 2000,
					fadeDurationMs: 500
				});
				setTimeout(
					() => {

						goto('/admin/login/');

					},
					2000 + 500
				);

			});
			setLogoutTimeout();

		},
		[]
	);

	return (
		<Button
			onClick={
				() => {

					setLogoutCallback(() => {

						goto('/admin/login/');

					});
					void logout();

				}
			}
		>
			{'Logout'}
		</Button>
	);

};
