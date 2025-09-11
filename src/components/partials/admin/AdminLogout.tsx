import { useEffect } from 'react';
import { addAdminButton } from '@/components/partials/admin/AdminButtonContainer';
import {
	logout,
	setLogoutTimeout
} from '@/frontend/adminApi';

export const AdminLogout = () => {

	useEffect(
		() => {

			setLogoutTimeout();

			addAdminButton({
				children: 'Logout',
				onClick: () => void logout()
			});

		},
		[]
	);

};
