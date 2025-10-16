import {
	defineConfig,
	globalIgnores
} from 'eslint/config';
import { astroReactTs } from 'lint-rules-alvin/eslint';

export default defineConfig(
	globalIgnores(['.husky', 'commitlint.config.ts']),
	...astroReactTs,
	{
		rules: {
			'import-x/no-restricted-paths': ['error', {
				zones: [
					{
						target: './src/frontend/**/*',
						from: './src/backend/**/*'
					},
					{
						target: './src/backend/**/*',
						from: './src/frontend/**/*'
					},
					{
						target: './src/**/*.astro',
						from: './src/frontend/**/*'
					}
				]
			}]
		}
	}
);
