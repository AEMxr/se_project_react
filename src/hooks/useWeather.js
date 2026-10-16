import { useEffect, useState } from "react";
import { fetchWeather } from "../utils/weatherApi.js";
import {
  DEFAULT_COORDS,
  GEOLOCATION_TIMEOUT_MS,
  GEOLOCATION_MAX_AGE_MS,
} from "../utils/constants.js";

const initialWeather = {
  city: "",
  condition: undefined,
  time: undefined,
  temperature: { F: null, C: null },
};

export default function useWeather() {
  const [weather, setWeather] = useState(initialWeather);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    let started = false;
    let disposed = false;
    let timer;

    function loadWeather(
      latitude = DEFAULT_COORDS.latitude,
      longitude = DEFAULT_COORDS.longitude,
    ) {
      if (started || disposed) return;
      started = true;
      clearTimeout(timer);
      fetchWeather(latitude, longitude, { signal: controller.signal })
        .then((data) => {
          if (!disposed) setWeather(data);
        })
        .catch((error) => {
          if (!disposed && error?.name !== "AbortError")
            setErrorMessage(
              "Weather is unavailable. Please try refreshing the page.",
            );
        })
        .finally(() => {
          if (!disposed) setIsLoading(false);
        });
    }

    timer = setTimeout(loadWeather, GEOLOCATION_TIMEOUT_MS);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          loadWeather(position.coords.latitude, position.coords.longitude),
        () => loadWeather(),
        { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_MAX_AGE_MS },
      );
    } else loadWeather();

    return () => {
      disposed = true;
      clearTimeout(timer);
      controller.abort();
    };
  }, []);
  return { weather, isLoading, errorMessage };
}
