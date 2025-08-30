# WTWR (What To Wear — React)

A weather-driven wardrobe assistant built with React + Vite. WTWR shows the current weather, lets you toggle °F/°C, and manage your clothing items (add / view / delete), backed by a local json-server mock API.

---

## Features

- **Live Weather Integration** (OpenWeatherMap) — fetches real-time weather for your location.
- **°F/°C Toggle via React Context** — one switch updates temperatures across the app.
- **Routing** — `/` (Main) and `/profile` (Profile) with Header/Footer on both.
- **Profile Page** — `SideBar` (hardcoded user) + `ClothesSection` (renders **all** items).
- **Clothing Items** — Add via **AddItemModal** (controlled form + validation), view in a modal, **delete with confirmation**.
- **Mock Backend** — `json-server` with `GET /items`, `POST /items`, `DELETE /items/:id`.
- **WeatherCard UX** — always shows an image; temperature displays “…” until data arrives.
- **Responsive Modals & Clean UI** — accessible, keyboard-friendly dialogs and controls.
- **(Optional/Extra)** Smart outfit randomizer (mobile prototype).

---

## Technologies & Techniques

- **React** (functional components & hooks)
- **Vite** (fast dev/build)
- **React Router** (HashRouter in production)
- **Context API** (temperature unit)
- **CSS + BEM** (or CSS Modules, depending on setup)
- **Normalize.css** for consistent base styles
- **Custom Fonts** (Cabinet Grotesk)
- **ESLint** (and Prettier conventions)
- **OpenWeatherMap API**

---

## Project Structure

    src/
      assets/                         # images/icons (e.g., avatar.svg, weatherConditions/)
      components/
        App/
          Header.jsx
          Main.jsx
          Footer.jsx
          ItemModal.jsx
          DeleteConfirmationModal.jsx
          ModalWithForm.jsx
          Profile.jsx
          ToggleSwitch.jsx
          # (styles live alongside components)
        AddItemModal/
          AddItemModal.jsx
      contexts/
        CurrentTemperatureUnitContext.js
      hooks/
        useForm.js
        useTouch.js
        formValidation.js
      utils/
        api.js            # json-server calls (GET/POST/DELETE)
        weatherApi.js     # OpenWeather fetch + parsing
        constants.js      # base URLs, defaults, etc.
      vendor/
        normalize.css
        fonts.css
        fonts/...
      index.css
      main.jsx
    db.json                            # mock database for json-server

---

## Getting Started

1. **Install**

   npm install

2. **Start the mock API (required for items)**

   npm run api

   # -> http://localhost:3001

   # Uses \_id as the primary key so deletes work consistently.

3. **Start Vite**

   npm run dev

   # -> http://localhost:5173

> If you edit `.env`, restart the dev server so Vite picks up changes.

---

## Environment Variables

Create a `.env` file in the project root:

    VITE_OPEN_WEATHER_KEY=YOUR_OPENWEATHERMAP_KEY

- Only variables prefixed with `VITE_` are exposed to the client (Vite convention).
- The app reads this in `weatherApi.js`.

---

## Scripts

These are defined in `package.json`:

    {
      "dev": "vite --open",
      "build": "vite build",
      "preview": "vite preview",
      "api": "json-server --watch db.json --id _id --port 3001",
      "predeploy": "npm run build",
      "deploy": "gh-pages -d dist"
    }

---

## API (json-server)

**Base URL:** `http://localhost:3001`

- **GET `/items`** → `[{ _id, name, imageUrl, weather }]`
- **POST `/items`** → Body: `{ name, imageUrl, weather }` → returns created item
- **DELETE `/items/:id`** → removes item

Notes:

- The app maps `imageUrl → link` internally for card rendering.
- `weather` is normalized to lowercase for consistency.

---

## Routes

- `/` → `Header + Main + Footer`
- `/profile` → `Header + Profile + Footer`
- Header logo → **navigates to `/`**
- Profile link → **navigates to `/profile`**

---

## Components & Data Flow (high level)

- **App.jsx**

  - Holds: weather data, clothing items, modal states, selected item.
  - Provides temperature unit context: `{ currentTemperatureUnit, handleToggleSwitchChange }`.
  - Loads items from `json-server` on mount (`getItems`), maps `imageUrl → link`.
  - Handlers:
    - **Add item:** `createItem` → prepend to state on success (form resets only after success).
    - **Delete item:** opens **DeleteConfirmationModal**; on confirm → `removeItem` → filter from state.

- **ToggleSwitch.jsx**

  - Reads temperature unit from **Context** by default (can also accept props).
  - Toggling flips between `"F"` and `"C"`.

- **WeatherCard.jsx / Main.jsx**

  - Use the Context unit to render `weather.temperature[currentTemperatureUnit]`.
  - Show “…” until temp is ready; always show a weather image.

- **AddItemModal.jsx**

  - Controlled form via `useForm`; touch/validation via `useTouch` + `formValidation`.
  - Disables submit while posting; resets **only after** the POST resolves.

- **ItemModal.jsx → DeleteConfirmationModal.jsx**
  - Clicking **Delete** in ItemModal opens a confirmation modal.
  - Confirming calls `removeItem` and updates state; both modals close.

---

## Code Style & Naming

- **camelCase** for variables/functions; **PascalCase** for components.
- Descriptive names.
- **ESLint** enabled; Prettier conventions for formatting.
- `normalize.css` imported **first** in `index.css`.
- Accessibility: interactive elements have focus/hover states and sensible labels.

---

## Troubleshooting

- **MetaMask / SES logs on localhost:** harmless extension output; you can disable the extension on localhost if noisy.
- **Weather shows `…`:** intentional until the API responds; °F/°C toggles once loaded.
- **Port conflicts:** tweak the `api` script port or stop other processes using `3001`/`5173`.
- **DELETE fails on newly created items:** ensure you started the server with `--id _id` (use `npm run api`).

---

## Contributing / Formatting

- Run ESLint before pushing:

        npm run lint

- `.prettierignore` `vendor/normalize.css`.

---

## Acknowledgements

- [React](https://react.dev/) • [Vite](https://vitejs.dev/) • [OpenWeatherMap](https://openweathermap.org/) • [Normalize.css](https://necolas.github.io/normalize.css/) • Cabinet Grotesk

---

## Inspiration

Project for TripleTen’s React curriculum — designed to help users make smarter, weather-based wardrobe choices every day.

> “No such thing as bad weather, only inappropriate clothing.” — Alfred Wainwright
