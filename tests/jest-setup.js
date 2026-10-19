import { beforeEach, afterEach, jest } from "@jest/globals";
import { TextDecoder, TextEncoder } from "node:util";
import { deserialize, serialize } from "node:v8";

const originalFetch = globalThis.fetch;
globalThis.TextEncoder ??= TextEncoder;
globalThis.TextDecoder ??= TextDecoder;
globalThis.structuredClone ??= (value) => deserialize(serialize(value));

beforeEach(() => {
  // No test can accidentally contact the real API or OpenWeather.
  globalThis.fetch = jest
    .fn()
    .mockRejectedValue(new Error("Unexpected network request in a test"));
  if (typeof window !== "undefined") {
    window.localStorage.clear();
    window.history.replaceState({}, "", "/");
    Object.defineProperty(navigator, "geolocation", {
      configurable: true,
      value: {
        getCurrentPosition: (success) =>
          success({ coords: { latitude: 49.28, longitude: -123.12 } }),
      },
    });
  }
});

afterEach(() => {
  jest.restoreAllMocks();
  globalThis.fetch = originalFetch;
});
