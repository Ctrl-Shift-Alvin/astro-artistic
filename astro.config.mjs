import node from '@astrojs/node';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import robotsTxt from 'astro-robots-txt';
import { defineConfig, envField } from 'astro/config';
import mkcert from 'vite-plugin-mkcert';

// https://astro.build/config
export default defineConfig({
	// Base: '.', // Set a path prefix.
	site: 'http://maxmaxwell.com/',
	trailingSlash: 'always',
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	devToolbar: { enabled: false },
	integrations: [
		react(),
		tailwindcss(),
		sitemap(),
		robotsTxt(),
		mkcert()
	],
	redirects: {},
	vite: {
		server: {
			host: '0.0.0.0',
			port: 4321,
			strictPort: true,
			allowedHosts: [
				'nasty',
				'testsite.local'
			],
			cors: true,
			hmr: true
		},
		resolve: {
			extensions: [
				'.js',
				'.ts',
				'.jsx',
				'.tsx'
			]
		},
		watch: {
			paths: [
				'src/*',
				'public/*'
			]
		},
		plugins: [
			tailwindcss(),
			mkcert({
				force: false,
				savePath: '.cert/',
				hosts: [ 'yourwebsite.eu' ],
				keyFileName: 'dev-key.pem',
				certFileName: 'dev-cert.pem'
			})
		]
	},
	env: {
		schema: {
			ADMIN_PASSWORD_HASH: envField.string({
				context: 'server',
				access: 'secret',
				optional: true
			}),
			JWT_KEY: envField.string({
				context: 'server',
				access: 'secret',
				optional: true
			}),
			JWT_LENGTH: envField.number({
				context: 'server',
				access: 'secret',
				optional: false,
				default: 1000
			})
		}
	},
	markdown: {
		shikiConfig: {
			// Choose from Shiki's built-in themes (or add your own)
			// https://github.com/shikijs/shiki/blob/main/docs/themes.md
			theme: 'monokai'
		}
	}
});
