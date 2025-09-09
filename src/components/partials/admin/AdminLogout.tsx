import { useEffect } from 'react';
import { addAdminButton } from '@/components/partials/admin/AdminButtonContainer';
import { Monolog } from '@/components/components/MonologProvider';
import {
	logout,
	setLogoutCallback,
	setLogoutTimeout
} from '@/frontend/protectedApi';
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

			addAdminButton({
				children: 'Logout',
				onClick: () => {

					setLogoutCallback(() => {

						goto('/admin/login/');

					});
					void logout();

				}
			});

		},
		[]
	);

};
