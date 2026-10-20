# Automated testing

The testing changes are on the `automated-tests` branch. The frontend stays in `se_project_react`; backend changes are isolated in the sibling `se_project_express-tests` worktree on its own `automated-tests` branch. The original backend and the optional iPhone worktree are unchanged.

## Frontend commands — Git Bash

From `~/Documents/TripleTen/se_project_react`:

```bash
npm run test:jest
npm run test:jest:coverage
```

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

## Suites and the 20 standalone functions

| Suite                                   | Functions or behavior                                                                                                                                                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `tests/unit/validation.jest.test.js`    | `formValidation`, `normalizeFormValues`                                                                                                                                                                                                    |
| `tests/unit/items.jest.test.js`         | `normalizeItem`, `mergeInitialItems`                                                                                                                                                                                                       |
| `tests/unit/errors.jest.test.js`        | `createAbortError`, `createUserError`, `getErrorMessage`, `rejectRequest`                                                                                                                                                                  |
| `tests/unit/request.jest.test.js`       | `handleResponse`                                                                                                                                                                                                                           |
| `tests/unit/api.jest.test.js`           | `getItems`, `createItem`, `removeItem`, `updateCurrentUser`, `toggleItemLike`                                                                                                                                                              |
| `tests/unit/auth.jest.test.js`          | `signIn`, `signUp`, `getCurrentUser`                                                                                                                                                                                                       |
| `tests/unit/weather.jest.test.js`       | `fetchWeather`, `getWeatherType`                                                                                                                                                                                                           |
| `tests/unit/outfitBuilder.jest.test.js` | `buildOutfit` with controlled randomness                                                                                                                                                                                                   |
| `tests/unit/hooks.jest.test.js`         | Form state, touched fields, submission guards/retries, midnight updates, geolocation deadlines, cleanup                                                                                                                                    |
| `tests/flows/*.jest.test.js`            | Registration and auto-login, restored sessions, protected routes, two-account ownership, profile editing, garment creation/deletion, likes, stale responses, failures, dialogs, keyboard focus, mobile menu, unit switching, randomization |

Suites group related work with `describe`; parameterized tests cover boundaries and invalid input. Network success and failure paths, draft retention, duplicate requests, input normalization, and stale results have explicit assertions. The original Node suite adds further overlapping-request regression coverage.

## Backend commands — a different folder

From Git Bash:

```bash
cd ~/Documents/TripleTen/se_project_express-tests
npm test
npm run test:coverage
npm run test:handles
```

Do not run those backend commands from the frontend directory. No normal backend server or database service needs to be started for the tests.

SuperTest sends real HTTP requests to the exported Express app using temporary ports. Tests use real Mongoose models, bcrypt, JWT signing/verification, and a disposable MongoDB instance. Every run chooses a unique `wtwr_test_...` database; cleanup checks both its generated name and the temporary server's port. Test code never uses the normal `MONGODB_URI`. Hooks connect, initialize indexes, insert/clear test records before and after cases, disconnect, and stop the owned MongoDB process.

The harness automatically finds an installed `mongod` on PATH or under the default Windows MongoDB installation directory. Otherwise it downloads a MongoDB test binary on first use, which requires network access. An optional `MONGOMS_SYSTEM_BINARY` can select an installed binary explicitly. See the backend worktree's `TESTING.md` for details.

Importing backend `app.js` starts neither a database connection nor `app.listen()`. Executing `node app.js` still starts the application normally. The tests also exposed malformed body/password types returning 500; the backend test branch corrects those cases to 400 and retains regression tests.

## Results and reports

Verified on October 19, 2026:

| Check                           | Result                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| Frontend Jest                   | 173 tests across 13 suites pass                                |
| Existing frontend Node tests    | 35 tests pass                                                  |
| Frontend Vite security build    | 1 test passes                                                  |
| Backend Jest/SuperTest/database | 252 tests across 13 suites pass                                |
| Frontend coverage               | 99.13% lines, 90% branches, 98.85% functions                   |
| Backend coverage                | 98.66% lines, 99.01% branches, 100% functions                  |
| Backend open handles            | Tests exit normally with `--detectOpenHandles`; no forced exit |

Both Jest configurations enforce minimum global coverage: 90% lines/statements, 85% branches, and 95% functions. Open `coverage/jest/index.html` in the frontend or `coverage/index.html` in the backend after a coverage run. Reports are ignored by Git, ESLint, and formatting checks where applicable.

These are unit and integration tests, not a complete browser end-to-end suite. jsdom does not verify CSS layout or iPhone rendering. Live weather availability, deployment configuration, and pixel matching still need browser/manual checks. Coverage measures executed code and does not prove the absence of bugs.

## Dependency audit

Compatible audit fixes were applied in the testing branches. Production dependency audits report zero vulnerabilities in both projects. Development-only advisories remain in tooling dependencies, including Jest's transitive `sprintf-js` chain and the backend's nodemon tooling. No forced major downgrades were applied. Review `npm audit` when updating the tooling; these advisories and their available fixes can change.

The backend worktree now validates signup, signin, profile, garment and item-ID requests with Celebrate/Joi before hashing or database work. Controllers forward failures to centralized error middleware, and Winston logs omit credentials, request/response bodies and raw exception messages. The validation suite proves invalid requests never reach those expensive operations, and logger tests inspect actual middleware output for sample secrets. See `se_project_express-tests/VALIDATION.md` for the full API constraints, middleware order and scoped dependency override.

## References

- [Jest code transformation](https://jestjs.io/docs/code-transformation)
- [SuperTest documentation](https://github.com/forwardemail/supertest)
- [MongoDB test runner integration](https://typegoose.github.io/mongodb-memory-server/docs/guides/integration-examples/test-runners/)
- [Celebrate validation and error middleware](https://github.com/arb/celebrate)
- [Express error handling](https://expressjs.com/en/guide/error-handling/)

The flow suites are split into authentication, wardrobe, request failures and accessibility. Shared helpers live in `tests/fixtures/appFlows.js`. The Node app regressions are split into authentication/profile, wardrobe and dialogs/weather, with shared setup in `tests/fixtures/nodeApp.js`.

GitHub Actions runs frontend lint, formatting, all automated suites and the production build on pushes to `main`/`automated-tests` and pull requests targeting `main`, using Node.js 22.
