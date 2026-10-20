import {
  API_KEY,
  BASE_URL,
  DEFAULT_COORDS,
  HOT_TEMPERATURE_F,
  WARM_TEMPERATURE_F,
  FREEZING_TEMPERATURE_F,
  CELSIUS_SCALE,
} from "./constants.js";
import { handleResponse } from "./request.js";
import { createUserError } from "./errors.js";

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
  if (!API_KEY)
    return Promise.reject(
      createUserError("Weather is unavailable. Please try again later."),
    );
  const url = new URL(BASE_URL);
  url.search = new URLSearchParams({
    lat,
    lon,
    units: "imperial",
    appid: API_KEY,
  });
  return handleResponse(fetch(url, { signal })).then((data) => {
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
  });
}

export function getWeatherType(temperature) {
  if (!Number.isFinite(temperature)) return null;
  if (temperature >= HOT_TEMPERATURE_F) return "hot";
  return temperature >= WARM_TEMPERATURE_F ? "warm" : "cold";
}
