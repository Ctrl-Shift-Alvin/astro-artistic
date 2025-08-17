export const adminIsSetup = !(
	!import.meta.env.ADMIN_PASSWORD_HASH
	|| !import.meta.env.JWT_KEY
	|| !import.meta.env.JWT_LENGTH
);
