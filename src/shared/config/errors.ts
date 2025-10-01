import { ZErrorsConfig } from './configTypes';

export const ErrorsConfig = ZErrorsConfig.parse({
	enableJsLogging: true,
	tableInitialBuildCount: 2,
	tableInitialErrorCount: 2
});
