import { API_KEY, BASE_URL, DEFAULT_COORDS } from "./constants";

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
    .then((data) => ({
      city: data.name,
      temperature: Math.round(data.main.temp),
    }));
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
