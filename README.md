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

React functional components and hooks, React Router, Context, Vite, Fetch, validator.js, BEM CSS, Normalize.css, Cabinet Grotesk, ESLint, Prettier, and Node's test runner with jsdom. The separate backend uses Express and MongoDB/Mongoose.

## Run locally in Git Bash

Use Node.js 22 or newer and install MongoDB Community Server. Clone the frontend and backend into sibling folders, for example:

```text
TripleTen/
  se_project_react/
  se_project_express/
```

Keep the database, backend, and frontend running. These are separate processes:

| Terminal                                          | Folder               | Process                    |
| ------------------------------------------------- | -------------------- | -------------------------- |
| A, if MongoDB is not already running as a service | Any folder           | MongoDB                    |
| B                                                 | `se_project_express` | Express API on port 3001   |
| C                                                 | `se_project_react`   | Vite frontend on port 3000 |

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
cd ~/Documents/TripleTen/se_project_express
npm ci
npm run dev
```

The API should listen at `http://localhost:3001`. Starting the frontend does not start Express or MongoDB.

### C. Frontend

Open another terminal **in the frontend folder**:

```bash
cd ~/Documents/TripleTen/se_project_react
npm ci
cp -n .env.example .env.local
```

Set your own key in `.env.local`:

```dotenv
VITE_OPEN_WEATHER_KEY=your_openweather_key
```

Then run:

```bash
npm run dev
```

Open `http://localhost:3000`. Restart Vite after changing environment values. Stop a running Vite process with Ctrl+C before reinstalling packages on Windows; otherwise its esbuild executable may be locked.

The optional `VITE_API_BASE_URL` overrides the default `http://localhost:3001`. The OpenWeather key is browser-facing configuration; Vite includes `VITE_` variables in the frontend build.

## Commands

| Command                | Purpose                                                   |
| ---------------------- | --------------------------------------------------------- |
| `npm run dev`          | Start the frontend                                        |
| `npm run lint`         | Check JavaScript/JSX                                      |
| `npm test`             | Run automated regression checks with mocked API responses |
| `npm run format`       | Apply Prettier formatting                                 |
| `npm run format:check` | Check formatting without editing                          |
| `npm run build`        | Produce `dist/`                                           |
| `npm run preview`      | Preview the production build locally                      |

## API and routing

The frontend calls the backend's `POST /signup`, `POST /signin`, `GET/PATCH /users/me`, `GET/POST /items`, `DELETE /items/:id`, and `PUT/DELETE /items/:id/likes` endpoints. Signup, signin, and listing items are public; protected requests include the saved Bearer token.

Development uses `/` and `/profile` through BrowserRouter. The production build uses HashRouter and the `/se_project_react/` base for GitHub Pages. Hosted use requires a reachable HTTPS backend configured at build time; the local Express setup is sufficient for this course project.

## Verification

Automated tests use fixture accounts and mocked API responses, without changing a real database. Before submitting, follow [the submission checklist](docs/submission-checklist.md) against your running backend to confirm persistence and two-account ownership.

Built by Anthony Malcuit for TripleTen.
