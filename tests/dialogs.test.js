import assert from "node:assert/strict";
import { test } from "node:test";
import {
  response,
  deferred,
  mount,
  query,
  all,
  click,
  settle,
  login,
  setGeolocation,
  act,
  App,
  GEOLOCATION_TIMEOUT_MS,
  testState,
} from "./fixtures/nodeApp.js";

test("dialogs trap keyboard focus, close with Escape and restore the trigger", async () => {
  await mount(App);
  const trigger = query(".header__auth-button:last-child");
  trigger.focus();
  await click(trigger);
  assert.equal(document.activeElement.name, "email");
  assert.equal(query("#root").hasAttribute("inert"), true);
  const last = query(".modal__secondary-action");
  await settle(() => last.focus());
  await settle(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Tab",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.equal(document.activeElement, query(".modal__close"));
  await settle(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
        cancelable: true,
      }),
    ),
  );
  assert.ok(query('[role="dialog"]') === null);
  assert.equal(document.activeElement, trigger);
  assert.equal(query("#root").hasAttribute("inert"), false);
});

test("mobile menu closes with Escape and exposes guest actions", async () => {
  await mount(App);
  await click(".header__menu-button");
  assert.equal(all(".mobile-menu__auth").length, 2);
  await settle(() =>
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    ),
  );
  assert.ok(query(".mobile-menu") === null);
});

test("broken avatars use an initial placeholder", async () => {
  await mount(App);
  await login();
  await settle(() =>
    query(".header__user-avatar").dispatchEvent(new Event("error")),
  );
  assert.equal(query(".avatar_placeholder").textContent, "A");
});

test("weather geolocation has a deadline and falls back once", async () => {
  const originalTimer = globalThis.setTimeout;
  setGeolocation(() => {});
  globalThis.setTimeout = (callback, delay, ...args) =>
    originalTimer(
      callback,
      delay === GEOLOCATION_TIMEOUT_MS ? 0 : delay,
      ...args,
    );
  try {
    await mount(App);
    await act(async () => {
      await new Promise((resolve) => originalTimer(resolve, 10));
    });
    const requests = testState.api.calls.filter(
      (call) => call.path === "/weather",
    );
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url.searchParams.get("lat"), "40.7128");
    assert.ok(query(".main__headliner").textContent.includes("70°F"));
  } finally {
    globalThis.setTimeout = originalTimer;
  }
});

test("weather pending does not display garments from all temperature categories", async () => {
  const held = deferred();
  testState.api.intercept((call) =>
    call.path === "/weather" ? held.promise : undefined,
  );
  await mount(App);
  assert.equal(all(".card").length, 0);
  assert.ok(query(".weather-card__image"));
  await settle(() =>
    held.resolve(
      response({
        name: "Vancouver",
        main: { temp: 70 },
        weather: [{ main: "Clear" }],
        dt: 100,
        sys: { sunrise: 0, sunset: 200 },
      }),
    ),
  );
  assert.equal(all(".card").length, 2);
});
