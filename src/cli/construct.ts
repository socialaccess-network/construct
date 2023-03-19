import { build, createServer } from 'vite'
import { ViteNodeServer } from 'vite-node/server'
import { ViteNodeRunner } from 'vite-node/client'
import { installSourcemapsSupport } from 'vite-node/source-map'
import {
	createHotContext,
	handleMessage,
	viteNodeHmrPlugin,
} from 'vite-node/hmr'
import { resolve } from 'path'
import { existsSync } from 'fs'
import { red } from 'kolorist'

const cwd = process.cwd()

const serverFolder = resolve(cwd, 'server')
const serverConfigFile = resolve(serverFolder, 'vite.config')
const serverConfig = existsSync(`${serverConfigFile}.ts`)
	? `${serverConfigFile}.ts`
	: existsSync(`${serverConfigFile}.js`)
	? `${serverConfigFile}.js`
	: undefined
const serverEntry = resolve(serverFolder, 'main.ts')

const clientFolder = resolve(cwd, 'client')
const clientConfigFile = resolve(clientFolder, 'vite.config')
const clientConfig = existsSync(`${clientConfigFile}.ts`)
	? `${clientConfigFile}.ts`
	: existsSync(`${clientConfigFile}.js`)
	? `${clientConfigFile}.js`
	: undefined

const cacheDir = resolve(cwd, 'node_modules/.vite')
const serverCacheDir = resolve(cacheDir, 'server')
const clientCacheDir = resolve(cacheDir, 'client')

let [command] = process.argv.slice(2)

if (!['dev', 'build', 'start'].includes(command)) command = 'dev'

const mode = command === 'dev' ? 'development' : 'production'

async function devServer() {
	// create vite server
	const server = await createServer({
		root: serverFolder,
		configFile: serverConfig,
		cacheDir: serverCacheDir,

		build: {
			ssr: serverEntry,
			rollupOptions: {
				input: serverEntry,
			},
		},

		optimizeDeps: {
			// It's recommended to disable deps optimization
			disabled: true,
		},

		plugins: [viteNodeHmrPlugin()],
	})
	// this is need to initialize the plugins
	await server.pluginContainer.buildStart({})

	// create vite-node server
	const node = new ViteNodeServer(server)

	// fixes stacktraces in Errors
	installSourcemapsSupport({
		getSourceMap: source => node.getSourceMap(source),
	})

	// create vite-node runner
	const runner = new ViteNodeRunner({
		root: server.config.root,
		base: server.config.base,
		// when having the server and runner in a different context,
		// you will need to handle the communication between them
		// and pass to this function
		fetchModule(id) {
			return node.fetchModule(id)
		},
		resolveId(id, importer) {
			return node.resolveId(id, importer)
		},
		createHotContext(runner, url) {
			return createHotContext(runner, server.emitter, [serverEntry], url)
		},
	})

	await runner.executeFile(serverEntry)

	server.emitter?.on('message', payload =>
		handleMessage(runner, server.emitter, [serverEntry], payload),
	)

	process.on('uncaughtException', err =>
		console.error(red('[vite-node] Failed to execute file: \n'), err),
	)
}

async function devClient() {
	const server = await createServer({
		root: clientFolder,
		configFile: clientConfig,
		cacheDir: clientCacheDir,
	})

	await server.listen()

	server.printUrls()
}

async function buildServer() {
	await build({
		root: serverFolder,
		configFile: serverConfig,
		cacheDir: serverCacheDir,

		server: {
			hmr: false,
		},

		build: {
			emptyOutDir: true,
			outDir: resolve(cwd, 'dist'),
			ssr: serverEntry,
			rollupOptions: {
				input: serverEntry,
				output: {
					format: 'cjs',
					entryFileNames: '[name].[format]',
				},
			},
		},
	})
}

async function buildClient() {
	await build({
		root: clientFolder,
		configFile: clientConfig,
		cacheDir: clientCacheDir,

		build: {
			emptyOutDir: true,
			outDir: resolve(cwd, 'dist/client'),
		},
	})
}

if (command === 'dev') {
	devServer()
	devClient()
} else if (command === 'build') {
	buildServer().then(buildClient)
}
