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
- Preserve the existing mobile outfit randomizer as an extra feature.

## Technologies

React functional components and hooks, React Router, Context, Vite, Fetch, validator.js, BEM CSS, Normalize.css, Cabinet Grotesk, ESLint, Prettier, Jest, React Testing Library, and Node's test runner with jsdom. The separate backend uses Express and MongoDB/Mongoose.

## Run locally in Git Bash

Use Node.js 22 or newer and install MongoDB Community Server. Clone the frontend and backend into sibling folders, for example:

```text
TripleTen/
  se_project_react/
  se_project_express/
```

Keep the database, backend, and frontend running. These are separate processes:

| Terminal                                          | Folder                     | Process                    |
| ------------------------------------------------- | -------------------------- | -------------------------- |
| A, if MongoDB is not already running as a service | Any folder                 | MongoDB                    |
| B                                                 | `se_project_express-tests` | Express API on port 3001   |
| C                                                 | `se_project_react`         | Vite frontend on port 3000 |

### A. Database

If MongoDB is running as a Windows service, use that service. For a manually started local database, run:

```bash
mkdir -p /c/data/db
mongod --dbpath /c/data/db
```

Keep this terminal running. The backend's database configuration is documented in its own repository.

### B. Backend

Open another terminal **in the backend folder**:

```bash
cd ~/Documents/TripleTen/se_project_express-tests
npm ci
npm run dev
```

This branch needs the updated backend in the separate `se_project_express-tests` worktree, including its `/weather` endpoint. The API should listen at `http://localhost:3001`. Stop another backend using port 3001 before starting it. Starting the frontend does not start Express or MongoDB.

The OpenWeather key belongs only in the backend's ignored `.env.local` as `OPEN_WEATHER_API_KEY`. Existing local settings were migrated there. For a fresh setup, copy the backend's `.env.example` to its `.env.local` and set the key there. See [weather setup](docs/weather-security.dev.md).

### C. Frontend

Open another terminal **in the frontend folder**:

```bash
cd ~/Documents/TripleTen/se_project_react
npm ci
cp -n .env.example .env.local
```

The frontend needs no OpenWeather key. Its optional `.env.local` contains only the public API address, `VITE_API_BASE_URL`. Local environment files and generated `project_dump.txt` snapshots are ignored by Git; only placeholder templates belong in version control.

Then run:

```bash
npm run dev
```

Open `http://127.0.0.1:3000`. Restart Vite after changing environment values. Stop a running Vite process with Ctrl+C before reinstalling packages on Windows; otherwise its esbuild executable may be locked.

Run only this frontend on port 3000. Stop the frontend from the optional `bug fixes and code refinement` worktree before starting the course version. The course server binds to `127.0.0.1` and fails if that address and port are occupied, rather than silently choosing another port. Use the explicit address above to avoid mixing worktrees through `localhost`. A first visit to this address may require signing in again because browser storage is separate from `localhost`.

The optional `VITE_API_BASE_URL` overrides the default `http://localhost:3001`. Weather requests go through Express, and the frontend build excludes weather credentials. For deployment, use an HTTPS API address and configure the key on the backend host.

## Commands

| Command                      | Purpose                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `npm run dev`                | Start the frontend                                        |
| `npm run lint`               | Check JavaScript/JSX                                      |
| `npm test`                   | Run automated regression checks with mocked API responses |
| `npm run test:jest`          | Run isolated Jest unit and user-flow suites               |
| `npm run test:jest:coverage` | Generate Jest coverage reports                            |
| `npm run test:security`      | Verify real Vite builds exclude weather credentials       |
| `npm run test:all`           | Run both the original regression suite and Jest           |
| `npm run format`             | Apply Prettier formatting                                 |
| `npm run format:check`       | Check formatting without editing                          |
| `npm run build`              | Produce `dist/`                                           |
| `npm run preview`            | Preview the production build locally                      |

## API and routing

The frontend calls the backend's `POST /signup`, `POST /signin`, `GET/PATCH /users/me`, `GET/POST /items`, `DELETE /items/:id`, and `PUT/DELETE /items/:id/likes` endpoints. Signup, signin, and listing items are public; protected requests include the saved Bearer token.

Development uses `/` and `/profile` through BrowserRouter. The production build uses HashRouter and the `/se_project_react/` base for GitHub Pages. Hosted use requires a reachable HTTPS backend configured at build time; the local Express setup is sufficient for this course project.

## Verification

Automated frontend tests use fixture accounts and mocked API responses, without changing a real database. See [the testing guide](docs/testing.dev.md) for Jest suites, coverage, and the separate backend worktree's SuperTest/database tests. Before submitting, follow [the submission checklist](docs/submission-checklist.dev.md) against your running backend to confirm persistence and two-account ownership.

Built by Anthony Malcuit for TripleTen.
