import { useEffect, useRef, useState } from "react";
import { fetchWeather } from "../utils/weatherApi.js";
import { getErrorMessage } from "../utils/errors.js";
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
  const [attempt, setAttempt] = useState(0);
  const coordinates = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const request = { started: false };
    const timer = setTimeout(loadWeather, GEOLOCATION_TIMEOUT_MS);
    setIsLoading(true);
    setErrorMessage("");

    function loadWeather(
      latitude = DEFAULT_COORDS.latitude,
      longitude = DEFAULT_COORDS.longitude,
    ) {
      if (request.started || controller.signal.aborted) return;
      request.started = true;
      clearTimeout(timer);
      coordinates.current = { latitude, longitude };
      fetchWeather(latitude, longitude, { signal: controller.signal })
        .then((data) => {
          if (!controller.signal.aborted) setWeather(data);
        })
        .catch((error) => {
          if (!controller.signal.aborted && error?.name !== "AbortError")
            setErrorMessage(
              `Weather is unavailable. ${getErrorMessage(error, "Please try again.")}`,
            );
        })
        .finally(() => {
          if (!controller.signal.aborted) setIsLoading(false);
        });
    }

    if (coordinates.current) {
      loadWeather(coordinates.current.latitude, coordinates.current.longitude);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          loadWeather(position.coords.latitude, position.coords.longitude),
        () => loadWeather(),
        { timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_MAX_AGE_MS },
      );
    } else loadWeather();

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [attempt]);

  function retry() {
    setAttempt((current) => current + 1);
  }

  return { weather, isLoading, errorMessage, retry };
}
