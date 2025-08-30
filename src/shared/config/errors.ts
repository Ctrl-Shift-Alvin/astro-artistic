import { ZErrorsConfig } from './configTypes';

export const ErrorsConfig = ZErrorsConfig.parse({
	enable: true,
	enableUserLogging: true,
	enableApiLogging: true,
	tableInitialBuildCount: 2,
	tableInitialErrorCount: 2
});
