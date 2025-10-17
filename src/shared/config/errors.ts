import { ZErrorsConfig } from './configTypes';

export const ErrorsConfig = ZErrorsConfig.parse({
	enableJsLogging: true,
	tableInitialBuildCount: 5,
	tableInitialErrorCount: 5
});
