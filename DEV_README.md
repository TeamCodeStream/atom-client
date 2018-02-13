## To get started locally

1. clone the repo
2. `cd` into the repo
3. run `apm install && apm link`
4. install the prettier-atom package in atom
5. in the settings for prettier-atom, enable the following settings

* 'Format Files on Save'
* 'Only format if Prettier is found in your project's dependencies'
* 'Only format if a Prettier config is found'

**Pro-tip** If you open atom in dev mode (`atom --dev path/to/project`), there will be additional
debugging functionality, which will be noted below. It's probably best to default to using the
`--dev` flag while working locally.

## Connecting to server

If you want to use a local instance of the api server, you'll need to use the dev_tools to create a
sandbox for it.

If you want to disable the confirmation code email and turn off the confirmation step, set the
following variables in your shell.

```bash
export CS_API_CONFIRMATION_NOT_REQUIRED=1
```

otherwise to get emails sent to your email address for local development, set:

```bash
export CS_API_EMAIL_TO=#your email here
```

Now you can start the api server. Next, you'll need to tell the plugin where the server is. Make sure to open the repository you want to use in atom's dev mode with the `--dev` flag from the command line or through the header menu at `View > Developer > Open In Dev Mode`.

### In Atom

Use one of the `Point to...` commands in the command palette.
The different endpoints are `local`, `Dev`, `QA`, and `Production`.
The fallback without this explicit configuration is the production environment.
These settings only persist per atom window.
So different windows can point to different servers.
The setting should also survive reloads until atom loses any serialized session for a window.
There is also a command, `Codestream: Which Environment?`, which can be used to see what the current setting is.

## Resetting the database(s)

At some point, you'll want to reset everything. The plugin keeps data cached in indexeddb so if you
wipe everything in mongo, you probably should clear indexeddb too.

You can use Mongo's app, [Compass](https://www.mongodb.com/products/compass), for interacting with
databases.

**Dev mode:** To clear what's in the client cache, open atom's command palette and run the
`Codestream: Wipe Cache` command.

If you want to logout and create a new session, from the command palette run `Codestream: Logout`.

## Redux DevTools

Visualizing the UI state is really helpful when trying to debug and see how the data changes. This
is where the Redux DevTools chrome extension comes in. Since atom runs on electron, which is sort of
an instance of chrome, it has support for some chrome extensions that are for the developer console.

To install the Redux DevTools, follow the steps
[here](https://github.com/electron/electron/blob/master/docs/tutorial/devtools-extension.md#how-to-load-a-devtools-extension).
**Note:** in those instructions, there's a reference to the `BrowserWindow` object. It can be
accessed with `require('electron').remote.BrowserWindow`.
