import { describe, expect, test } from "@jest/globals";
import { fetchWeather, getWeatherType } from "../../src/utils/weatherApi.js";
import { jsonResponse } from "../fixtures/response.js";

const weather = {
  name: "Vancouver",
  main: { temp: 74.6 },
  weather: [{ main: "Clear" }],
  dt: 150,
  sys: { sunrise: 100, sunset: 200 },
};

describe("getWeatherType", () => {
  test.each([
    [32, "cold"],
    [65, "cold"],
    [66, "warm"],
    [79, "warm"],
    [85.9, "warm"],
    [86, "hot"],
    [100, "hot"],
  ])("classifies %p°F as %s", (temperature, category) =>
    expect(getWeatherType(temperature)).toBe(category),
  );
  test.each([undefined, null, NaN, Infinity, -Infinity, "70"])(
    "does not invent a category for %p",
    (temperature) => expect(getWeatherType(temperature)).toBeNull(),
  );
});

describe("fetchWeather", () => {
  test("requests weather from Express without exposing credentials and normalizes the result", async () => {
    const controller = new AbortController();
    fetch.mockResolvedValue(jsonResponse(weather));
    await expect(
      fetchWeather(49.28, -123.12, { signal: controller.signal }),
    ).resolves.toEqual({
      city: "Vancouver",
      temperature: { F: 75, C: 24 },
      condition: "Sunny",
      time: "day",
    });
    const [input, options] = fetch.mock.calls[0];
    const url = new URL(input);
    expect(url.origin).toBe("http://localhost:3001");
    expect(url.pathname).toBe("/weather");
    expect(Object.fromEntries(url.searchParams)).toEqual({
      lat: "49.28",
      lon: "-123.12",
    });
    expect(options.signal).toBe(controller.signal);
    expect(options.headers).toBeUndefined();
  });
  test("uses default coordinates when none are supplied", async () => {
    fetch.mockResolvedValue(jsonResponse(weather));
    await fetchWeather();
    const url = new URL(fetch.mock.calls[0][0]);
    expect(url.searchParams.get("lat")).toBe("40.7128");
    expect(url.searchParams.get("lon")).toBe("-74.006");
  });
  test.each([
    ["Clouds", "Cloudy"],
    ["Drizzle", "Rain"],
    ["Rain", "Rain"],
    ["Thunderstorm", "Storm"],
    ["Snow", "Snow"],
    ["Mist", "Fog"],
    ["Haze", "Fog"],
    ["Fog", "Fog"],
    ["Unknown", "Sunny"],
  ])("maps %s to %s", async (main, condition) => {
    fetch.mockResolvedValue(jsonResponse({ ...weather, weather: [{ main }] }));
    expect((await fetchWeather()).condition).toBe(condition);
  });
  test.each([
    [99, "night"],
    [100, "day"],
    [199, "day"],
    [200, "night"],
  ])("handles sunrise/sunset at %s as %s", async (dt, time) => {
    fetch.mockResolvedValue(jsonResponse({ ...weather, dt }));
    expect((await fetchWeather()).time).toBe(time);
  });
  test("handles missing optional city/condition fields", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ ...weather, name: "", weather: undefined }),
    );
    expect(await fetchWeather()).toMatchObject({
      city: "Unknown location",
      condition: "Sunny",
    });
  });
  test.each([null, "75", undefined])(
    "rejects an invalid temperature (%p)",
    async (temp) => {
      fetch.mockResolvedValue(jsonResponse({ ...weather, main: { temp } }));
      await expect(fetchWeather()).rejects.toThrow("Invalid weather response");
    },
  );
  test("propagates server errors", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ message: "Weather rate limit" }, 429),
    );
    await expect(fetchWeather()).rejects.toMatchObject({
      status: 429,
      message: "Weather rate limit",
    });
  });
  test("propagates network errors", async () => {
    const error = new TypeError("Offline");
    fetch.mockRejectedValue(error);
    await expect(fetchWeather()).rejects.toBe(error);
  });
  test("preserves abort errors so cancelled requests do not become user-facing failures", async () => {
    const error = new DOMException("Request cancelled", "AbortError");
    fetch.mockRejectedValue(error);
    await expect(fetchWeather()).rejects.toBe(error);
  });
});
