import assert from "node:assert/strict";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { build } from "vite";

test("client builds expose the API address while excluding weather credentials", async () => {
  const values = {
    VITE_API_BASE_URL: "https://api.fixture.example",
    VITE_OPEN_WEATHER_KEY: "legacy-weather-secret-sentinel",
    OPEN_WEATHER_API_KEY: "server-weather-secret-sentinel",
    VITE_API_BASE_URL_SECRET: "similar-name-secret-sentinel",
  };
  const previous = Object.fromEntries(
    Object.keys(values).map((name) => [name, process.env[name]]),
  );
  Object.assign(process.env, values);
  try {
    const result = await build({
      configFile: fileURLToPath(new URL("../vite.config.js", import.meta.url)),
      logLevel: "silent",
      plugins: [
        {
          name: "weather-environment-check",
          resolveId: (id) =>
            id === "virtual:weather-environment" ? id : undefined,
          load: (id) =>
            id === "virtual:weather-environment"
              ? "globalThis.weatherEnvironmentCheck = import.meta.env;"
              : undefined,
        },
      ],
      build: {
        write: false,
        rollupOptions: { input: "virtual:weather-environment" },
      },
    });
    const bundles = Array.isArray(result) ? result : [result];
    const code = bundles
      .flatMap((bundle) => bundle.output)
      .filter((entry) => entry.type === "chunk")
      .map((entry) => entry.code)
      .join("\n");
    assert.ok(code.includes(values.VITE_API_BASE_URL));
    for (const [name, value] of Object.entries(values)) {
      if (name === "VITE_API_BASE_URL") continue;
      assert.ok(!code.includes(value));
      assert.ok(!code.includes(name));
    }
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
