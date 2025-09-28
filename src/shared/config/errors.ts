import { ZErrorsConfig } from './configTypes';

export const ErrorsConfig = ZErrorsConfig.parse({
	enableJsLogging: true,
	enableResponseLogging: true,
	responseLoggingStatusCodes: [
		400,
		401,
		403,
		404,
		414,
		421,
		431,
		451,
		500,
		501,
		502,
		504,
		508
	],
	tableInitialBuildCount: 2,
	tableInitialErrorCount: 2
});
