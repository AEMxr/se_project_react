import assert from "node:assert/strict";
import { test, beforeEach, afterEach, after } from "node:test";
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
} from "./helpers.js";
const { default: App } = await import("../src/components/App.jsx");
const { GEOLOCATION_TIMEOUT_MS } = await import("../src/utils/constants.js");
let api;
const originalFetch = globalThis.fetch;
const originalError = console.error;
let errors = [];
beforeEach(() => {
  api = fixture();
  globalThis.fetch = api.fetch;
  setGeolocation();
  errors = [];
  console.error = (...args) => {
    errors.push(args.map(String).join(" "));
  };
});
afterEach(async () => {
  await cleanup();
  globalThis.fetch = originalFetch;
  console.error = originalError;
  assert.deepEqual(errors, [], "Unexpected console errors");
});
after(() => dom.window.close());

test("guest sees weather-appropriate cards and cannot enter profile", async () => {
  window.history.replaceState({}, "", "/profile");
  await mount(App);
  assert.equal(window.location.pathname, "/");
  assert.equal(all("h1").length, 1);
  assert.equal(all(".card").length, 2);
  assert.equal(all(".card__like").length, 0);
  await click(".toggle-switch__label");
  assert.ok(query(".main__headliner").textContent.includes("21°C"));
  assert.ok(query(".weather-card__temp").textContent.includes("21°C"));
});

test("course recommendations show matching garments from every account without optional filters", async () => {
  localStorage.setItem("jwt", "token:account-a");
  api.db.items[1].condition = ["Rain"];
  api.db.items[1].color = "red";
  await mount(App);
  assert.deepEqual(
    all(".card__title").map((title) => title.textContent),
    ["Sweater", "T-Shirt"],
  );
});

test("no matching garments leaves the main clothing area empty", async () => {
  api.db.items[0].weather = "cold";
  api.db.items[1].weather = "hot";
  await mount(App);
  assert.equal(all(".card").length, 0);
  assert.equal(query(".main__status"), null);
  assert.equal(query(".main__randomize-button").disabled, true);
});

test("signup automatically logs in and restores the session after remount", async () => {
  await mount(App);
  await click(".header__auth-button");
  await input("email", "new@example.com");
  await input("password", "Password1!");
  await input("name", "New User");
  await input("avatar", "https://example.com/avatar.jpg");
  await click(".modal__submit");
  assert.ok(query(".header__user-name").textContent.includes("New User"));
  assert.ok(localStorage.getItem("jwt"));
  assert.ok(query('[role="dialog"]') === null);
  const token = localStorage.getItem("jwt");
  await cleanup();
  localStorage.setItem("jwt", token);
  await mount(App);
  assert.equal(query(".header__user-name").textContent, "New User");
});

test("development StrictMode restores a saved session after effect cleanup", async () => {
  localStorage.setItem("jwt", "token:account-a");
  await mount(function DevelopmentRoot() {
    return createElement(StrictMode, null, createElement(App));
  });
  assert.equal(query(".header__user-name").textContent, "Account A");
  assert.equal(all(".card").length, 2);
  await click(".header__user");
  assert.equal(all(".card").length, 2);
  assert.equal(all(".sidebar__action").length, 2);
});

test("failed item loading shows a request error without an empty-wardrobe message", async () => {
  localStorage.setItem("jwt", "token:account-a");
  api.intercept(({ path, method }) =>
    path === "/items" && method === "GET"
      ? Promise.reject(new TypeError("Failed to fetch"))
      : undefined,
  );
  await mount(App);
  await click(".header__user");
  assert.ok(query(".app__error").textContent.includes("could not be loaded"));
  assert.equal(all(".card").length, 0);
  assert.equal(query(".clothes__status"), null);
});

test("bad credentials show backend feedback and retain editable inputs", async () => {
  await mount(App);
  await click(".header__auth-button:last-child");
  await input("email", "a@example.com");
  await input("password", "WrongPassword1!");
  await click(".modal__submit");
  assert.equal(
    query(".modal__error").textContent,
    "Incorrect email or password",
  );
  assert.equal(query('input[name="email"]').value, "a@example.com");
  assert.equal(query(".modal__submit").disabled, false);
});

test("duplicate registration displays its backend message", async () => {
  await mount(App);
  await click(".header__auth-button");
  for (const [name, value] of Object.entries({
    email: "a@example.com",
    password: "Password1!",
    name: "New User",
    avatar: "https://example.com/avatar.jpg",
  }))
    await input(name, value);
  await click(".modal__submit");
  assert.equal(
    query(".modal__error").textContent,
    "Email is already registered",
  );
  assert.equal(api.db.users.length, 2);
});

test("profile contains only its owner's cards and logout redirects home", async () => {
  await mount(App);
  await login();
  await click(".header__user");
  assert.equal(all(".clothes__grid .card").length, 2);
  assert.ok(
    all(".card__title").every(
      (entry) => !entry.textContent.includes("T-Shirt"),
    ),
  );
  await click(".sidebar__action:last-child");
  assert.equal(localStorage.getItem("jwt"), null);
  assert.equal(window.location.pathname, "/");
  assert.ok(query(".header__user") === null);
});

test("likes and unlikes survive a frontend reload", async () => {
  await mount(App);
  await login();
  await click(".card__like");
  assert.equal(query(".card__like").getAttribute("aria-pressed"), "true");
  const token = localStorage.getItem("jwt");
  await cleanup();
  localStorage.setItem("jwt", token);
  await mount(App);
  assert.equal(query(".card__like").getAttribute("aria-pressed"), "true");
  await click(".card__like");
  assert.equal(query(".card__like").getAttribute("aria-pressed"), "false");
});

test("creating a garment preserves normalized values and survives reload", async () => {
  await mount(App);
  await login();
  await click(".header__add-clothes-button");
  assert.equal(query('input[name="image"]').type, "url");
  assert.equal(query('input[type="file"]'), null);
  assert.equal(query('[name="color"]'), null);
  await input("name", "  New sweater  ");
  await input("image", "https://example.com/new.jpg");
  await click(".modal__submit");
  assert.equal(api.db.items[0].name, "New sweater");
  assert.equal(api.db.items[0].owner, "account-a");
  assert.equal(all(".card").length, 3);
  const token = localStorage.getItem("jwt");
  await cleanup();
  localStorage.setItem("jwt", token);
  await mount(App);
  assert.equal(all(".card").length, 3);
});

test("initial GET arriving after creation cannot erase the new garment", async () => {
  const held = deferred();
  const snapshot = structuredClone(api.db.items);
  api.intercept((call) =>
    call.path === "/items" && call.method === "GET" ? held.promise : undefined,
  );
  await mount(App);
  await login();
  await click(".header__add-clothes-button");
  await input("name", "New sweater");
  await input("image", "https://example.com/new.jpg");
  await click(".modal__submit");
  await settle(() => held.resolve(response(snapshot)));
  assert.equal(all(".card").length, 3);
  assert.equal(
    all(".card__title").filter((entry) => entry.textContent === "New sweater")
      .length,
    1,
  );
});

test("initial GET containing a newly created item cannot produce duplicate cards", async () => {
  const creation = deferred();
  const loading = deferred();
  api.intercept((call) => {
    if (call.path === "/items" && call.method === "GET") return loading.promise;
    if (call.path === "/items" && call.method === "POST")
      return creation.promise;
  });
  await mount(App);
  await login();
  await click(".header__add-clothes-button");
  await input("name", "New sweater");
  await input("image", "https://example.com/new.jpg");
  await click(".modal__submit");
  const item = {
    _id: "created",
    owner: "account-a",
    name: "New sweater",
    imageUrl: "https://example.com/new.jpg",
    weather: "warm",
    likes: [],
  };
  await settle(() => loading.resolve(response([item, ...api.db.items])));
  await settle(() => creation.resolve(response(item, 201)));
  assert.equal(
    all(".card__title").filter((entry) => entry.textContent === "New sweater")
      .length,
    1,
  );
});

test("old add success cannot close or erase a reopened form", async () => {
  const held = deferred();
  api.intercept((call) =>
    call.path === "/items" && call.method === "POST" ? held.promise : undefined,
  );
  await mount(App);
  await login();
  await click(".header__add-clothes-button");
  await input("name", "Old sweater");
  await input("image", "https://example.com/old.jpg");
  await click(".modal__submit");
  await click(".modal__close");
  await click(".header__add-clothes-button");
  await input("name", "Fresh draft");
  await settle(() =>
    held.resolve(
      response(
        {
          _id: "old",
          owner: "account-a",
          name: "Old sweater",
          imageUrl: "https://example.com/old.jpg",
          weather: "warm",
        },
        201,
      ),
    ),
  );
  assert.equal(query('input[name="name"]').value, "Fresh draft");
  assert.ok(query('[role="dialog"]') !== null);
});

test("switching away from a pending login prevents its result restoring that session", async () => {
  const held = deferred();
  api.intercept((call) =>
    call.path === "/signin" && call.body.email === "a@example.com"
      ? held.promise
      : undefined,
  );
  await mount(App);
  await click(".header__auth-button:last-child");
  await input("email", "a@example.com");
  await input("password", "Password1!");
  await click(".modal__submit");
  await click(".modal__secondary-action");
  for (const [name, value] of Object.entries({
    email: "new@example.com",
    password: "Password1!",
    name: "New User",
    avatar: "https://example.com/avatar.jpg",
  }))
    await input(name, value);
  await click(".modal__submit");
  const saved = localStorage.getItem("jwt");
  await settle(() => held.resolve(response({ token: "token:account-a" })));
  assert.equal(localStorage.getItem("jwt"), saved);
  assert.equal(query(".header__user-name").textContent, "New User");
});

test("late profile response cannot replace another signed-in account", async () => {
  const held = deferred();
  api.intercept((call) =>
    call.path === "/users/me" && call.method === "PATCH"
      ? held.promise
      : undefined,
  );
  await mount(App);
  await login();
  await click(".header__user");
  await click(".sidebar__action");
  await input("name", "Changed A");
  await click(".modal__submit");
  await click(".modal__close");
  await click(".sidebar__action:last-child");
  await login("b@example.com");
  await settle(() =>
    held.resolve(response({ ...api.db.users[0], name: "Changed A" })),
  );
  assert.equal(query(".header__user-name").textContent, "Account B");
});

test("profile saves from reopened forms execute in order and preserve the new draft", async () => {
  const held = deferred();
  let patchCount = 0;
  api.intercept((call) => {
    if (call.path !== "/users/me" || call.method !== "PATCH") return;
    patchCount += 1;
    if (patchCount === 1)
      return held.promise.then(() => {
        Object.assign(api.db.users[0], call.body);
        return response(api.db.users[0]);
      });
  });
  await mount(App);
  await login();
  await click(".header__user");
  await click(".sidebar__action");
  assert.equal(query('input[name="name"]').value, "Account A");
  await input("name", "First name");
  await click(".modal__submit");
  await click(".modal__close");
  await click(".sidebar__action");
  await input("name", "Latest name");
  await click(".modal__submit");
  assert.equal(patchCount, 1);
  await settle(() => held.resolve());
  assert.equal(patchCount, 2);
  assert.equal(api.db.users[0].name, "Latest name");
  assert.equal(query(".header__user-name").textContent, "Latest name");
  assert.ok(query('[role="dialog"]') === null);
});

test("delete confirmation is guarded, and failure permits retry", async () => {
  const held = deferred();
  let deletes = 0;
  api.intercept((call) => {
    if (call.method === "DELETE" && !call.path.endsWith("/likes")) {
      deletes += 1;
      return held.promise;
    }
  });
  await mount(App);
  await login();
  await click(".card__preview");
  await click(".item-modal__delete");
  await click(".del-modal__confirm");
  await settle(() => {
    query(".del-modal__confirm").click();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
  assert.equal(deletes, 1);
  assert.ok(query('[role="dialog"]') !== null);
  assert.equal(query(".del-modal__cancel").matches(":disabled"), true);
  await settle(() => held.resolve(response({ message: "Try again" }, 500)));
  assert.equal(query(".modal__error").textContent, "Try again");
  assert.equal(query(".del-modal__confirm").matches(":disabled"), false);
  api.intercept(() => undefined);
  await click(".del-modal__confirm");
  assert.equal(
    api.db.items.some((item) => item._id === "a-warm"),
    false,
  );
  assert.ok(query('[role="dialog"]') === null);
});

test("another owner's preview never offers a delete button", async () => {
  await mount(App);
  await login("b@example.com");
  await click(".card__preview");
  assert.ok(query(".item-modal__delete") === null);
});

test("current-session 401 clears authentication and closes the active form", async () => {
  await mount(App);
  await login();
  await click(".header__user");
  await click(".sidebar__action");
  localStorage.setItem("jwt", "invalid-token");
  await input("name", "Changed");
  await click(".modal__submit");
  assert.equal(localStorage.getItem("jwt"), null);
  assert.ok(query('[role="dialog"]') === null);
  assert.equal(window.location.pathname, "/");
  assert.ok(query(".app__error").textContent.includes("session expired"));
});

test("old protected 401 cannot sign out a newer account", async () => {
  const held = deferred();
  api.intercept((call) =>
    call.path.endsWith("/likes") ? held.promise : undefined,
  );
  await mount(App);
  await login();
  await click(".card__like");
  await click(".header__user");
  await click(".sidebar__action:last-child");
  await login("b@example.com");
  await settle(() => held.resolve(response({ message: "Unauthorized" }, 401)));
  assert.equal(localStorage.getItem("jwt"), "token:account-b");
  assert.equal(query(".header__user-name").textContent, "Account B");
});

test("invalid stored token redirects to the guest home page", async () => {
  localStorage.setItem("jwt", "invalid");
  window.history.replaceState({}, "", "/profile");
  await mount(App);
  assert.equal(localStorage.getItem("jwt"), null);
  assert.equal(window.location.pathname, "/");
});

test("network failure shows form feedback while retaining fields", async () => {
  api.intercept((call) =>
    call.path === "/signin"
      ? Promise.reject(new TypeError("Failed to fetch"))
      : undefined,
  );
  await mount(App);
  await click(".header__auth-button:last-child");
  await input("email", "a@example.com");
  await input("password", "Password1!");
  await click(".modal__submit");
  assert.ok(
    query(".modal__error").textContent.includes("Unable to reach the server"),
  );
  assert.equal(query('input[name="email"]').value, "a@example.com");
});

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
  assert.equal(query(".avatar__placeholder").textContent, "A");
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
    const requests = api.calls.filter(
      (call) => call.url.hostname === "api.openweathermap.org",
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
  api.intercept((call) =>
    call.url.hostname === "api.openweathermap.org" ? held.promise : undefined,
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
