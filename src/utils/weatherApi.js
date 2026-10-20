import {
  DEFAULT_COORDS,
  HOT_TEMPERATURE_F,
  WARM_TEMPERATURE_F,
  FREEZING_TEMPERATURE_F,
  CELSIUS_SCALE,
} from "./constants.js";
import { BASE, handleResponse } from "./request.js";

const OPEN_WEATHER_MAP_TO_APP_CONDITION = {
  Clear: "Sunny",
  Clouds: "Cloudy",
  Rain: "Rain",
  Drizzle: "Rain",
  Thunderstorm: "Storm",
  Snow: "Snow",
  Mist: "Fog",
  Fog: "Fog",
  Haze: "Fog",
};

export function fetchWeather(
  lat = DEFAULT_COORDS.latitude,
  lon = DEFAULT_COORDS.longitude,
  { signal } = {},
) {
  const query = new URLSearchParams({
    lat,
    lon,
  });
  return handleResponse(fetch(`${BASE}/weather?${query}`, { signal })).then(
    (data) => {
      if (!Number.isFinite(data?.main?.temp))
        throw new Error("Invalid weather response");
      const condition =
        OPEN_WEATHER_MAP_TO_APP_CONDITION[data.weather?.[0]?.main] || "Sunny";
      const time =
        data.dt >= data.sys?.sunrise && data.dt < data.sys?.sunset
          ? "day"
          : "night";
      return {
        city: data.name || "Unknown location",
        temperature: {
          F: Math.round(data.main.temp),
          C: Math.round(
            (data.main.temp - FREEZING_TEMPERATURE_F) * CELSIUS_SCALE,
          ),
        },
        condition,
        time,
      };
    },
  );
}

export function getWeatherType(temperature) {
  if (!Number.isFinite(temperature)) return null;
  if (temperature >= HOT_TEMPERATURE_F) return "hot";
  return temperature >= WARM_TEMPERATURE_F ? "warm" : "cold";
}
