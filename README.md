# WTWR (What To Wear React)

A weather-driven wardrobe assistant built with React + Vite. WTWR helps you decide what to wear based on real-time weather data, offering smart outfit suggestions and a clean, responsive UI.

---

## Features

- **Live Weather Integration:** Fetches real-time weather data for your location.
- **Smart Outfit Randomizer:** Suggests layered outfits tailored to temperature and conditions (mobile version only).
- **Responsive Modals:** View item details and add new clothing with sleek modal dialogs.
- **Mobile-First Design:** Looks great on any device.
- **Customizable Wardrobe:** Add, view, and explore clothing items.
- **Modern UI:** Clean, accessible, and visually appealing interface.

---

## Technologies & Techniques

- **React** (functional components & hooks)
- **Vite** (blazing-fast dev/build tool)
- **CSS Modules & BEM** for maintainable styles
- **Normalize.css** for cross-browser consistency
- **Custom Fonts** (Cabinet Grotesk)
- **OpenWeatherMap API** for live weather
- **Prettier & ESLint** for code quality

---

## Project Structure

```
src/
  assets/         # Images and icons
  components/     # All React components
  utils/          # Constants and API helpers
  vendor/         # normalize.css, fonts.css, and fonts/
  index.css
  main.jsx
```

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the development server**
   ```bash
   npm run dev
   ```
3. **Build for production**
   ```bash
   npm run build
   ```

---

## Code Style

- **camelCase** for variables and functions
- **PascalCase** for components
- **Descriptive names** throughout
- **Prettier** for formatting (`.prettierignore` excludes normalize.css)
- **.gitignore** excludes `node_modules`, `dist`, `.DS_Store`

---

## Acknowledgements

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [OpenWeatherMap](https://openweathermap.org/)
- [Cabinet Grotesk Font](https://www.myfonts.com/fonts/monotype/cabinet-grotesk/)
- [Normalize.css](https://necolas.github.io/normalize.css/)

---

## Inspiration

Project for TripleTen’s React curriculum — designed to help users make smarter, weather-based wardrobe choices every day.

---

> _“No such thing as bad weather, only inappropriate clothing.”_ — Alfred Wainwright

---
