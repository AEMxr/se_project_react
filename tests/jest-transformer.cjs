const { transformSync } = require("esbuild");
const { createHash } = require("node:crypto");
const { readFileSync } = require("node:fs");

module.exports = {
  getCacheKey(source, filename, options) {
    return createHash("sha256")
      .update(source)
      .update(filename)
      .update(options.configString)
      .update(readFileSync(__filename))
      .digest("hex");
  },
  process(source, filename) {
    const result = transformSync(source, {
      loader: "jsx",
      format: "cjs",
      target: "node22",
      jsx: "automatic",
      sourcefile: filename,
      sourcemap: "external",
      define: {
        "import.meta.env.PROD": "false",
        "import.meta.env.BASE_URL": JSON.stringify("/"),
        "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
          "http://localhost:3001",
        ),
      },
    });
    return { code: result.code, map: result.map };
  },
};
