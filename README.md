# Listen Later

A web application for storing things to listen to later on Spotify. Built using SvelteKit & Firebase.

## Dependencies

Firebase Tools are required for local emulators:

```bash
npm i -g firebase-tools
```

## Developing

Once Firebase Tool are installed (and dependencies in general have been installed via `npm i`), the application (including required emulators) may be run using:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview` (updated from `vite preview` to `firebase emulators:start` - allowing the built site to be previewed via the Firebase Hosting emulator).

## Testing

To run the integration tests locally, ensure your're running in dev mode (`npm run dev`) or hosting the built site (via `npm run build && npm run preview`).

The tests may then be run via `npm run test:integration`.

Unit tests may be run via `npm run test:unit`.
