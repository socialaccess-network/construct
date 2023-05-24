# @socialaccess-network/construct

Construct is a lightweight build tool for full-stack JavaScript applications with a server/client monorepo. It is built on-top of [vite](https://github.com/vitejs/vite) and [vite-node](https://github.com/vitest-dev/vitest/tree/main/packages/vite-node).

## Features

- single command for running the server and client
- handles building the client and server
- can be used with any frontend framework provided it is a vite project

## Getting Started

To get started with a new project, you can use the [create-construct](https://github.com/socialaccess-network/create-construct) command using your preferred package manager.

```bash
# npm
npm create construct

# yarn
yarn create construct
```

### Adding to an Existing Project

To add construct to an existing project, you can install the `@sa-net/construct` package using your preferred package manager.

```bash
# npm
npm install -D @sa-net/construct

# yarn
yarn add -D @sa-net/construct
```

Then update your `package.json` to include the following scripts:

```json
{
	"scripts": {
		"dev": "construct dev",
		"build": "construct build",
		"start": "node dist/main.cjs"
	}
}
```

Construct expects a few things currently:

- the server code is in a `server` directory and has a entrypoint `server/main.ts`
- the client code is in a `client` directory and is a valid vite project

Outside of that, you are free to do what you want. You can also extend the vite config by adding a `vite.config` file to the `server` or `client` folder and the config will be merged.

### Expected File Structure

```bash
- package.json (has construct scripts)
- client (a valid vite project)
- server
	- main.ts
```

## Build Output

The build command currently outputs the following into the `dist` folder in the root of your project:

- `dist/client` - the built client code
- `dist/main.cjs` - the built server code

To start the server, you can run `node dist/main.cjs`. As for the client code, you can serve it however you want.

For example, you could setup the server code to serve the client files, a static file server, CDN, or web servers like nginx or apache. There are many options, and some require specific setups, which is why construct will not manage this for you.

```

```
