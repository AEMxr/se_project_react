import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { transform } from "esbuild";

export async function load(url, context, nextLoad) {
  if (/\.(css|svg|png|jpg|otf)$/.test(url))
    return {
      format: "module",
      source: `export default ${JSON.stringify(url)};`,
      shortCircuit: true,
    };
  if (
    url.startsWith(new URL("../src/", import.meta.url).href) &&
    /\.jsx?$/.test(url)
  ) {
    const source = await readFile(fileURLToPath(url), "utf8");
    const result = await transform(source, {
      loader: url.endsWith(".jsx") ? "jsx" : "js",
      format: "esm",
      jsx: "automatic",
      define: {
        "import.meta.env": JSON.stringify({
          PROD: false,
          BASE_URL: "/",
          VITE_OPEN_WEATHER_KEY: "test-only-key",
          VITE_API_BASE_URL: "http://localhost:3001",
        }),
      },
    });
    return { format: "module", source: result.code, shortCircuit: true };
  }
  return nextLoad(url, context);
}
