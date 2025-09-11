import {
	useEffect,
	useLayoutEffect
} from 'react';
import { addAdminButton } from '@/components/partials/admin/AdminButtonContainer';
import {
	logout,
	setLogoutTimeout
} from '@/frontend/adminApi';

export const AdminLogout = () => {

	useLayoutEffect(() => {

		addAdminButton({
			children: 'Logout',
			onClick: () => void logout()
		});

	});

	useEffect(
		() => {

			setLogoutTimeout();

		},
		[]
	);

};
