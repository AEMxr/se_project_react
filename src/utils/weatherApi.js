import { BASE_URL, DEFAULT_COORDS } from "./constants";

const API_KEY = import.meta.env.VITE_OPEN_WEATHER_KEY;

const OWM_TO_APP_CONDITION = {
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
  lon = DEFAULT_COORDS.longitude
) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&units=imperial&appid=${API_KEY}`;
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("location fetch failed");
      return res.json();
    })
    .then((data) => {
      const owmMain = data.weather[0].main;
      const condition = OWM_TO_APP_CONDITION[owmMain] || "Sunny";
      const now = data.dt;
      const sunrise = data.sys.sunrise;
      const sunset = data.sys.sunset;
      const time = now >= sunrise && now < sunset ? "day" : "night";
      return {
        city: data.name,
        temperature: {
          F: Math.round(data.main.temp),
          C: Math.round(((data.main.temp - 32) * 5) / 9),
        },
        condition,
        time,
      };
    });
}

// Example temperature range function
export function getWeatherType(temperature) {
  if (temperature >= 86) {
    return "hot";
  } else if (temperature >= 66) {
    return "warm";
  } else {
    return "cold";
  }
}
