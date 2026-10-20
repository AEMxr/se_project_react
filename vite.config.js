import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const environment = loadEnv(
    mode,
    fileURLToPath(new URL(".", import.meta.url)),
    "VITE_API_BASE_URL",
  );
  return {
    base: mode === "production" ? "/se_project_react/" : "/",
    plugins: [react()],
    // Disable automatic environment exposure and publish this one public value.
    envPrefix: [],
    define: {
      "import.meta.env.VITE_API_BASE_URL": JSON.stringify(
        environment.VITE_API_BASE_URL || "http://localhost:3001",
      ),
    },
    server: { host: "127.0.0.1", port: 3000, strictPort: true },
  };
});
