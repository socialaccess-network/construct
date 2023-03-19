import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		minify: false,
		lib: {
			entry: {
				'cli/construct': 'src/cli/construct.ts',
			},
			formats: ['es'],
		},
		rollupOptions: {
			external: [
				'path',
				'child_process',
				'fs',
				'vite',
				'vite-node/server',
				'vite-node/client',
				'vite-node/source-map',
				'fs/promises',
			],
		},
	},
})
