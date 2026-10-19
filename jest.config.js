export default {
  testEnvironment: "node",
  testEnvironmentOptions: { url: "http://localhost:3000/" },
  testMatch: ["<rootDir>/tests/**/*.jest.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/jest-setup.js"],
  transform: { "^.+\\.jsx?$": "<rootDir>/tests/jest-transformer.cjs" },
  moduleNameMapper: {
    "\\.(css|svg|png|jpe?g|otf)$": "<rootDir>/tests/jest-asset.cjs",
  },
  clearMocks: true,
  restoreMocks: true,
  coverageProvider: "v8",
  collectCoverageFrom: ["src/**/*.{js,jsx}", "!src/main.jsx"],
  coverageDirectory: "coverage/jest",
  coverageReporters: ["text", "html", "json-summary"],
  coverageThreshold: {
    global: { statements: 90, branches: 85, functions: 95, lines: 90 },
  },
};
