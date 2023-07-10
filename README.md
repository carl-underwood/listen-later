# Listen Later

A web application for storing things to listen to later on Spotify. Built using SvelteKit & Firebase.

## Dependencies

Firebase Tools are required for local emulators:

```bash
npm i -g firebase-tools
```

[Java](https://www.oracle.com/uk/java/technologies/downloads/) is also required to run the emulators locally.

## Developing

Once Firebase Tool are installed (and dependencies in general have been installed via `npm i`), the application (including required emulators) may be run using:

```bash
npm run dev
```

## Building

To create a production version of your app:

```bash
npm run build
npm run build --workspace ./functions
```

You can preview the production build with `npm run preview` (updated from `vite preview` to `firebase emulators:start` - allowing the built site to be previewed via the Firebase Hosting emulator).

## Testing

To run the integration tests locally, ensure your're running in dev mode (`npm run dev`) or hosting the built site (via `npm run build && npm run preview`).

The tests may then be run via `npm run test:integration`.

Unit tests may be run via `npm run test:unit`.

## CI / CD

The `.github/workflows` directory contains the GitHub Actions workflows that are run on PR & merge.

`build-and-test.yml` is a reusable workflow that's run on PR as well as on merge. It lints, builds and tests the site and functions against the Firebase Emulators. The [Playwright container](https://playwright.dev/docs/ci#via-containers) `mcr.microsoft.com/playwright:v1.35.0-jammy` is used to avoid the overhead of installing browsers and dependencies on each run. Since this container doesn't have Java installed (which is required for the Firebase Emulators to run) the `actions/setup-java@v3` step is used to install Java.

`merge.yml` first runs the job from `build-and-test.yml`, before deploying the site to Firebase and running smoke tests against the deployed site.
