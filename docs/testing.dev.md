# Automated testing

The frontend and backend testing changes were prepared on their respective `automated-tests` branches and integrated into `main` in `se_project_react` and `se_project_express`. The optional iPhone worktree remains separate and unchanged.

## Frontend commands — Git Bash

From `~/Documents/TripleTen/se_project_react`:

```bash
npm run test:jest
```

Use `npm run test:jest:coverage` instead when you also need a coverage report, or `npm run test:a11y` for only the axe/keyboard checks. Those accessibility suites are already included in a full Jest run.

Run a specific suite:

```bash
npm run test:jest -- tests/unit/weather.jest.test.js
npm run test:jest -- tests/flows
```

The existing Node regression suite is preserved as `npm test`. Run everything with:

```bash
npm run test:all
```

The frontend Jest/Node regression tests work without running Vite, Express, MongoDB, or a real weather key. Fetch is blocked by default, and each request test supplies a mock. The Jest transformer uses the existing esbuild dependency to support JSX, ES modules, and fixed test-only Vite environment values. BEM names and stylesheet ownership were standardized without changing CSS declarations. The frontend request helper reads Celebrate's validation details so existing form alerts show specific field errors while preserving drafts and allowing retry.

`npm run test:security` runs an actual Vite build in memory with fake private and legacy weather keys. It proves the public API address reaches client code and neither key does, even if an old weather environment variable is present. This check is included in `npm run test:all`. The weather API now calls Express's public `/weather` endpoint with coordinates only. See [weather security and setup](weather-security.dev.md).

## Suites and standalone functions

| Suite                                   | Functions or behavior                                                                                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/unit/validation.jest.test.js`    | `formValidation`, `normalizeFormValues`                                                                                                                                                                                                    |
| `tests/unit/items.jest.test.js`         | `normalizeItem`, `mergeInitialItems`                                                                                                                                                                                                       |
| `tests/unit/errors.jest.test.js`        | `createAbortError`, `createUserError`, `getErrorMessage`, `rejectRequest`                                                                                                                                                                  |
| `tests/unit/request.jest.test.js`       | `handleResponse` response parsing and HTTP errors                                                                                                                                                                                          |
| `tests/unit/timeouts.jest.test.js`      | `request` deadlines, stalled response bodies, cancellation, timer/listener cleanup, and no automatic mutation retries                                                                                                                      |
| `tests/unit/transport.jest.test.js`     | Injected synchronous/asynchronous HTTP transports preserve request options, parsed results, and errors                                                                                                                                     |
| `tests/unit/api.jest.test.js`           | `getItems`, `createItem`, `removeItem`, `updateCurrentUser`, `toggleItemLike`                                                                                                                                                              |
| `tests/unit/auth.jest.test.js`          | `signIn`, `signUp`, `getCurrentUser`                                                                                                                                                                                                       |
| `tests/unit/weather.jest.test.js`       | `fetchWeather`, `getWeatherType`                                                                                                                                                                                                           |
| `tests/unit/outfitBuilder.jest.test.js` | `buildOutfit` with controlled randomness                                                                                                                                                                                                   |
| `tests/unit/hooks.jest.test.js`         | Form state, touched fields, submission guards/retries, midnight updates, geolocation deadlines, cleanup                                                                                                                                    |
| `tests/unit/images.jest.test.js`        | Image loading, cached images, broken images, URL changes, collection skeletons, eager/lazy loading                                                                                                                                         |
| `tests/flows/*.jest.test.js`            | Registration and auto-login, restored sessions, protected routes, two-account ownership, profile editing, garment creation/deletion, likes, stale responses, failures, dialogs, keyboard focus, mobile menu, unit switching, randomization |

Suites group related work with `describe`; parameterized tests cover boundaries and invalid input. Network success and failure paths, draft retention, duplicate requests, input normalization, and stale results have explicit assertions. The original Node suite adds further overlapping-request regression coverage.

`tests/flows/wcag.jest.test.js` adds nine axe checks covering page/form/dialog states. `tests/flows/skip-navigation.jest.test.js` verifies keyboard bypass of repeated navigation and accessible profile naming. Together with the transport contract suite, these add 15 tests. The [engineering notes](engineering-practices.dev.md) explain the test-first changes, SOLID examples, rendered Chrome accessibility checks, and their limits. `npm run test:a11y` runs the focused axe/keyboard suites; they also run in the full Jest suite and CI.

## Loading behavior

Weather, session verification, and clothing requests run independently. The main page waits for valid weather before choosing a temperature category; the profile can show its clothing while weather is still pending. A pending empty collection displays four noninteractive skeleton cards. Available garments remain usable during an outstanding collection request.

Garment cards and previews reserve their existing image dimensions, display a neutral loading placeholder, and show an unavailable-image fallback on failure. The first four card images load eagerly; later images use the browser's lazy-loading hint. Preview images load eagerly. Image decoding is asynchronous, and custom fonts use `font-display: swap` so text can appear while fonts load.

The image unit suite and `tests/flows/loading.jest.test.js` add 14 tests covering slow requests, failures, cached images, URL changes, and usable forms, likes, previews, and temperature controls while other resources remain pending.

A separate Chrome check used the production build with delayed fixture APIs and images at 1440×1000 and 390×810. It verified skeleton replacement, usable forms/previews before responses, eager/lazy attributes, broken-image fallback, and no horizontal overflow on the narrow viewport. The first desktop card frame stayed 253×253px and the mobile preview frame stayed 343×343px before and after its portrait image loaded. This checks browser layout, not real iPhone performance or live API speed.

All frontend API calls use a 15-second deadline covering the connection and response-body reading. The shared request helper combines that deadline with caller cancellation, then removes its timer and abort listener on completion. Timeouts show readable errors and release pending form/collection states. No request is retried automatically, including mutations whose server-side result may be uncertain after a timeout.

Failed weather and clothing requests have separate Retry buttons in the existing page error area. Retrying clears that error and reloads only the affected data. Weather reuses the coordinates from its first request, and clothing retries preserve mutations made during the new request. `tests/flows/recovery.jest.test.js` covers independent retries, late timed-out results, draft retention, deletion dismissal, and verification timeouts. The hook suite also checks pending weather cleanup. A Chrome check at 390px verified both retry controls fit, weather/clothing recover independently, temperature controls work during a retry, and successful recovery clears the error.

## Backend commands — a different folder

From Git Bash:

```bash
cd ~/Documents/TripleTen/se_project_express
npm test
npm run test:coverage
npm run test:handles
```

Do not run those backend commands from the frontend directory. No normal backend server or database service needs to be started for the tests.

SuperTest sends real HTTP requests to the exported Express app using temporary ports. Tests use real Mongoose models, bcrypt, JWT signing/verification, and a disposable MongoDB instance. Every run chooses a unique `wtwr_test_...` database; cleanup checks both its generated name and the temporary server's port. Test code never uses the normal `MONGODB_URI`. Hooks connect, initialize indexes, insert/clear test records before and after cases, disconnect, and stop the owned MongoDB process.

The harness automatically finds an installed `mongod` on PATH or under the default Windows MongoDB installation directory. Otherwise it downloads a MongoDB test binary on first use, which requires network access. An optional `MONGOMS_SYSTEM_BINARY` can select an installed binary explicitly. See the backend worktree's `TESTING.md` for details.

Importing backend `app.js` starts neither a database connection nor `app.listen()`. Executing `node app.js` still starts the application normally. The tests also exposed malformed body/password types returning 500; the backend test branch corrects those cases to 400 and retains regression tests.

## Results and reports

Frontend verified on October 20, 2026. Backend lint, formatting and all 286 tests with coverage were reverified on October 20 before merging its tested revision into `main`.

| Check                           | Result                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| Frontend Jest                   | 228 tests across 21 suites pass                                |
| Existing frontend Node tests    | 35 tests pass                                                  |
| Frontend Vite security build    | 1 test passes                                                  |
| Backend Jest/SuperTest/database | 286 tests across 14 suites pass                                |
| Frontend coverage               | 99.47% lines, 92% branches, 98.96% functions                   |
| Backend coverage                | 98.78% lines, 99.12% branches, 100% functions                  |
| Backend open handles            | Tests exit normally with `--detectOpenHandles`; no forced exit |

Both Jest configurations enforce minimum global coverage: 90% lines/statements, 85% branches, and 95% functions. Open `coverage/jest/index.html` in the frontend or `coverage/index.html` in the backend after a coverage run. Reports are ignored by Git, ESLint, and formatting checks where applicable.

These are unit and integration tests, not a complete browser end-to-end suite. jsdom does not verify CSS layout or iPhone rendering. Live weather availability, deployment configuration, and pixel matching still need browser/manual checks. Coverage measures executed code and does not prove the absence of bugs.

## Dependency audit

On October 20, 2026, the frontend's full `npm audit` reports zero vulnerabilities, including development dependencies. A scoped override makes `@istanbuljs/load-nyc-config` use `js-yaml` 4.3.2 or a compatible 4.x release, removing its old `argparse`/`sprintf-js` dependency chain without downgrading Jest. The loader uses the supported `load()` API; YAML configuration/extends parsing and the full test/coverage checks verify compatibility. Remove the override when upstream updates its dependency. Dependency advisories can change, so rerun `npm audit` when updating packages.

Backend audit results are separate: its last production audit was clean, while development-tool advisories remained. This frontend audit does not modify the backend dependency tree.

The backend now validates signup, signin, profile, garment and item-ID requests with Celebrate/Joi before hashing or database work. Controllers forward failures to centralized error middleware, and Winston logs omit credentials, request/response bodies and raw exception messages. The validation suite proves invalid requests never reach those expensive operations, and logger tests inspect actual middleware output for sample secrets. See `se_project_express/VALIDATION.md` for the full API constraints, middleware order and scoped dependency override.

## References

- [Jest code transformation](https://jestjs.io/docs/code-transformation)
- [SuperTest documentation](https://github.com/forwardemail/supertest)
- [MongoDB test runner integration](https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/)
- [Celebrate validation and error middleware](https://github.com/arb/celebrate)
- [Express error handling](https://expressjs.com/en/guide/error-handling/)

The flow suites are split into authentication, wardrobe, request failures, accessibility, independent loading and timeout recovery. Shared helpers live in `tests/fixtures/appFlows.js`. The Node app regressions are split into authentication/profile, wardrobe and dialogs/weather, with shared setup in `tests/fixtures/nodeApp.js`.

GitHub Actions runs frontend lint, formatting, all automated suites and the production build on pushes to `main`/`automated-tests` and pull requests targeting `main`, using Node.js 22. Successful builds are retained as commit-specific artifacts for seven days. The Pages job deploys that verified artifact only from `main` when the public HTTPS API variable and Pages settings are configured. Workflow YAML, verification dependencies, matching artifact names, and ten backend-address validation cases passed local checks; a hosted deployment has not been performed for these changes.

The [October 20 audit follow-up](audit-follow-up.dev.md) records 11 additional session-mutation regressions, 34 backend HTTP-security regressions, clean native installations and a real frontend-to-Express/MongoDB/weather verification.
