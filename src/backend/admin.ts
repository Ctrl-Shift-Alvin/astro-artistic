
/**
 * `true` if `ADMIN_PASSWORD_HASH`, `JWT_KEY` and `JWT_LENGTH` are set in the .env. Otherwise, `false`.
 */
export const isAdminSetup = !(
	!import.meta.env.ADMIN_PASSWORD_HASH
	|| !import.meta.env.JWT_KEY
	|| !import.meta.env.JWT_LENGTH
);
