# Listen Later

![Listen Later Logo](./static/mstile-144x144.png)

[https://listenlater.cloud](https://listenlater.cloud)

A web application for storing things to listen to later on Spotify. Built using SvelteKit & Firebase.

## Dependencies

### Firebase Tools

Firebase Tools are required for local emulators:

```bash
npm i -g firebase-tools
```

[Java](https://www.oracle.com/uk/java/technologies/downloads/) is also required to run the emulators locally.

### .env files

A `.env` file should be introduced in the project root as well as in `./functions`. See the `.env.example` files in those locations to see the values that are required.

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

The tests may then be run via `npm run test:integration`. Since App Check is used to protect the application, a `PUBLIC_FIREBASE_APPCHECK_DEBUG_TOKEN` will need to be set in `.env` (App Check is also inforced on Firestore Database, however when running the emulators this doesn't appear to cause issues).

Unit tests may be run via `npm run test:unit`.

Smoke tests also exist, and can be run via `npm run test:smoke`. These are run in the GitHub Actions "merge" workflow to verify the configuration and functionality of the production application (on <https://listenlater.cloud>) post-deployment. Since App Check is used to protect the application, a `FIREBASE_APPCHECK_DEBUG_TOKEN` will need to be set in `smoke-tests/.env`. `MAILINATOR_API_TOKEN` will also need to be set in `smoke-tests/.env` as the tests result in a sign in link being sent to an `@listenlater.testinator.com` inbox. The tests then fetch this email in order to click the link and sign in.

Finally, a test exists to generate the screenshots used on the home and about pages. This test is not run in the CI / CD workflows, and can be run manually via `npm run generate-screenshots`. This will save the screenshots in the `src/assets` directory.

## CI / CD

The `.github/workflows` directory contains the GitHub Actions workflows that are run on PR & merge.

`build-and-test.yml` is a reusable workflow that's run on PR as well as on merge. It lints, builds and tests the site and functions against the Firebase Emulators. The [Playwright container](https://playwright.dev/docs/ci#via-containers) `mcr.microsoft.com/playwright:v1.41.2-jammy` is used to avoid the overhead of installing browsers and dependencies on each run. Since this container doesn't have Java installed (which is required for the Firebase Emulators to run) the `actions/setup-java@v4` step is used to install Java.

`merge-1.0.x.yml` first runs the job from `build-and-test.yml`, before deploying the site to Firebase and running smoke tests against the deployed site.

## Favicons

The favicons were generated using [https://realfavicongenerator.net/](https://realfavicongenerator.net/) from the SVG logos in [listen-later-logo-bordered.svg](./listen-later-logo-bordered.svg) and [listen-later-logo.svg](./listen-later-logo.svg).

These logos were created using [Boxy SVG](https://boxy-svg.com/) and were based on Material Symbols icons [More Time](https://fonts.google.com/icons?selected=Material+Symbols+Outlined:more_time:FILL@0;wght@400;GRAD@0;opsz@48&icon.query=clock) and [Headphones](https://fonts.google.com/icons?selected=Material+Symbols+Outlined:headphones:FILL@1;wght@400;GRAD@0;opsz@48&icon.query=music&icon.set=Material+Symbols).
