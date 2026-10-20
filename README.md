# WTWR — What to Wear

WTWR is a React frontend for a weather-based wardrobe application, built for TripleTen Project 14. It connects to an Express API and MongoDB for account registration, authentication, profile updates, clothing items, and likes.

**Backend repository:** [AEMxr/se_project_express](https://github.com/AEMxr/se_project_express)

## Features

- Register and sign in through validated forms; registration signs in automatically.
- Restore a saved JWT on refresh and clear it on logout or a current-session authentication failure.
- Protect `/profile` and show only the signed-in user's clothing there.
- Edit a user's name and avatar, with current values prefilled.
- Add garments, preview items, and confirm deletion of owned items.
- Like and unlike items, with saved likes reflected after refresh.
- Show OpenWeather conditions and weather-appropriate garments; toggle Fahrenheit/Celsius through React Context.
- Display an initial in a circle when an avatar is missing or cannot load.
- Use keyboard-accessible cards and dialogs, with visible validation and request errors.
- Skip repeated navigation with a keyboard-visible link; keep readable contrast for validation, weather labels, and heart controls.
- Keep weather, clothing, and session requests independent; show collection skeletons and image placeholders while loading, with a fallback for broken garment images.
- Bound API requests to 15 seconds and retry failed weather or clothing loads independently; timed-out forms retain their drafts for another attempt.
- Preserve the existing mobile outfit randomizer as an extra feature.

## Technologies

React functional components and hooks, React Router, Context, Vite, Fetch, validator.js, BEM CSS, Normalize.css, Cabinet Grotesk, ESLint, Prettier, Jest, React Testing Library, and Node's test runner with jsdom. The separate backend uses Express and MongoDB/Mongoose.

## Run locally in Git Bash

Use Node.js 22 or newer and MongoDB Community Server. Use `main` in both repositories; the backend includes the required weather endpoint. From a parent folder, clone into ordinary sibling folders:

```bash
git clone --branch main https://github.com/AEMxr/se_project_react.git
git clone --branch main https://github.com/AEMxr/se_project_express.git
```

Keep the database, backend, and frontend running as separate processes:

| Terminal                                    | Folder               | Process                    |
| ------------------------------------------- | -------------------- | -------------------------- |
| A, only if MongoDB is not already a service | Any folder           | MongoDB                    |
| B                                           | `se_project_express` | Express API on port 3001   |
| C                                           | `se_project_react`   | Vite frontend on port 3000 |

### A. Database

Use the existing MongoDB Windows service if installed. Otherwise, in terminal A:

```bash
mkdir -p /c/data/db
mongod --dbpath /c/data/db
```

### B. Backend

In terminal B, from the parent folder:

```bash
cd se_project_express
npm ci
npm run setup:env
```

The setup command creates an ignored `.env.local` and generates a private JWT secret without printing it. Running it again preserves valid existing settings. Set `OPEN_WEATHER_API_KEY` in that backend file, then start Express:

```bash
npm run dev
```

The API listens at `http://localhost:3001` and must include `/weather`. See [weather setup](docs/weather-security.dev.md). Starting Vite does not start Express or MongoDB.

### C. Frontend

In terminal C, from the parent folder:

```bash
cd se_project_react
npm ci
cp -n .env.example .env.local
npm run dev
```

Open `http://127.0.0.1:3000`. The frontend needs no weather key; its optional `VITE_API_BASE_URL` setting contains only the public backend address. Restart Vite after changing that setting. For hosted use, configure an HTTPS backend address before building.

Run one frontend on port 3000 and one backend on port 3001. Stop a running Vite process with Ctrl+C before reinstalling dependencies on Windows to release esbuild's executable.

## Course architecture

`App.jsx` owns the required clothing, user, modal, selected-item and temperature state. Custom hooks group authentication, clothing requests and modal controls; `AppModals` renders the active dialog. Promise failures propagate to the shared form/card feedback. BEM names use `block__element_modifier`, with the base class retained.

The supplied rubric describes a weather key in frontend `constants.js`. This version intentionally keeps the key in the backend and retrieves weather through `GET /weather`. The browser receives the same weather data needed for the course UI, without provider credentials. This is a documented architectural deviation for the reviewer.

Registration and profile editing require an avatar URL, as in the course forms. The initial fallback handles broken image links or missing existing profile data.

## Engineering practices

These practices guide the implementation; the links provide concrete examples rather than a claim that every module satisfies every principle:

| Practice                                                     | Application in this project                                                                                                                                                                                             |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **BEM** — Block, Element, Modifier                           | CSS uses `block__element_modifier` names and retains each modified element's base class.                                                                                                                                |
| **DRY** — Don't Repeat Yourself                              | Shared form fields, validation, request handling, and [clothing grids](src/components/App/Main/ClothingGrid.jsx) avoid duplicate behavior.                                                                              |
| **KISS** — Keep It Simple, Stupid                            | Small functional components/hooks and native Fetch handle the course behavior without an additional application framework.                                                                                              |
| **YAGNI** — You Aren't Gonna Need It                         | Garment entry keeps the required image-URL form.                                                                                                                                                                        |
| **SRP** — Single Responsibility Principle                    | Weather, authentication, clothing requests, and dialog behavior have focused hooks.                                                                                                                                     |
| **SoC** — Separation of Concerns                             | Components render UI, hooks manage state/lifecycles, API modules describe endpoints, and the request helper handles HTTP behavior.                                                                                      |
| **SOLID**                                                    | Focused responsibilities and callback contracts, plus an [injectable HTTP transport](src/utils/request.js) checked by substitution tests. See the [principle-by-principle evidence](docs/engineering-practices.dev.md). |
| **AAA** — Arrange, Act, Assert                               | Tests prepare fixtures, perform user actions or service calls, then assert observable results.                                                                                                                          |
| **TDD** — Test-Driven Development                            | The new transport, skip-navigation, and accessible profile-name changes followed failing-test → implementation → verification cycles. Older code was not all developed test-first.                                      |
| **CI/CD** — Continuous Integration / Delivery and Deployment | GitHub Actions checks the code, packages a verified build, and configures a gated Pages deployment from `main`. Hosting prerequisites are described below.                                                              |
| **WCAG** — Web Content Accessibility Guidelines              | Semantic controls, associated errors, keyboard navigation, dialog focus, contrast fixes, and axe checks target WCAG 2.2 A/AA criteria. Automated checks do not establish full WCAG conformance.                         |

The [engineering notes](docs/engineering-practices.dev.md) record the scope, test-first examples, accessibility review, and remaining manual checks.

## Commands

| Command                      | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `npm run dev`                | Start the frontend                                        |
| `npm run lint`               | Check JavaScript/JSX                                      |
| `npm test`                   | Run automated regression checks with mocked API responses |
| `npm run test:jest`          | Run isolated Jest unit and user-flow suites               |
| `npm run test:jest:coverage` | Generate Jest coverage reports                            |
| `npm run test:a11y`          | Run axe and keyboard skip-navigation checks               |
| `npm run test:security`      | Verify real Vite builds exclude weather credentials       |
| `npm run test:all`           | Run Node, Jest, and client-build security checks          |
| `npm run format`             | Apply Prettier formatting                                 |
| `npm run format:check`       | Check formatting without editing                          |
| `npm run build`              | Produce `dist/`                                           |
| `npm run preview`            | Preview the production build locally                      |

## API and routing

The frontend calls the backend's `POST /signup`, `POST /signin`, `GET/PATCH /users/me`, `GET/POST /items`, `DELETE /items/:id`, and `PUT/DELETE /items/:id/likes` endpoints. Signup, signin, and listing items are public; protected requests include the saved Bearer token.

Development uses `/` and `/profile` through BrowserRouter. The production build uses HashRouter and the `/se_project_react/` base for GitHub Pages. Hosted use requires a reachable HTTPS backend configured at build time; the local Express setup is sufficient for this course project.

## Delivery and deployment

The [frontend workflow](.github/workflows/checks.yml) retains each successful build as `wtwr-frontend-<commit SHA>` for seven days. Its Pages job runs only from `main`, after verification succeeds, and when the repository variable `VITE_API_BASE_URL` is set. The address must use HTTPS and contain no credentials, query, or fragment.

For hosted releases, enable GitHub Actions as the Pages publishing source and set that public backend address under repository Actions variables. The backend must be reachable and allow the frontend origin. The workflow publishes the already-verified artifact. With no variable configured, deployment is skipped and local development continues normally. This change configures the workflow; it does not itself publish a site or provision a backend.

## Verification

Automated frontend tests use fixture accounts and mocked API responses, without changing a real database. See [the testing guide](docs/testing.dev.md) for Jest suites, coverage, and the backend's SuperTest/database tests. The [October 20 audit follow-up](docs/audit-follow-up.dev.md) records clean native installations and a separate check of the actual frontend API functions against Express, disposable MongoDB, and live weather. Before submitting, follow [the submission checklist](docs/submission-checklist.dev.md) against your running backend to confirm browser behavior and your local configuration.

Built by Anthony Malcuit for TripleTen.
