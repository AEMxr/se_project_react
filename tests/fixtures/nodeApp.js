import assert from "node:assert/strict";
import { beforeEach, afterEach, after } from "node:test";
import { act, createElement, StrictMode } from "react";
import {
  dom,
  fixture,
  response,
  deferred,
  mount,
  cleanup,
  query,
  all,
  click,
  input,
  settle,
  login,
  setGeolocation,
} from "../helpers.js";
const { default: App } = await import("../../src/components/App.jsx");
const { GEOLOCATION_TIMEOUT_MS } = await import("../../src/utils/constants.js");
const testState = {};
const originalFetch = globalThis.fetch;
const originalError = console.error;
testState.errors = [];
beforeEach(() => {
  testState.api = fixture();
  globalThis.fetch = testState.api.fetch;
  setGeolocation();
  testState.errors = [];
  console.error = (...args) => {
    testState.errors.push(args.map(String).join(" "));
  };
});
afterEach(async () => {
  await cleanup();
  globalThis.fetch = originalFetch;
  console.error = originalError;
  assert.deepEqual(testState.errors, [], "Unexpected console errors");
});
after(() => dom.window.close());
export {
  dom,
  response,
  deferred,
  mount,
  cleanup,
  query,
  all,
  click,
  input,
  settle,
  login,
  setGeolocation,
  act,
  createElement,
  StrictMode,
  App,
  GEOLOCATION_TIMEOUT_MS,
  testState,
};
