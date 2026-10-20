import assert from "node:assert/strict";
import { test } from "node:test";
import {
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
  createElement,
  StrictMode,
  App,
  testState,
} from "./fixtures/nodeApp.js";

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
  assert.equal(testState.api.db.users.length, 2);
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

test("switching away from a pending login prevents its result restoring that session", async () => {
  const held = deferred();
  testState.api.intercept((call) =>
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
  testState.api.intercept((call) =>
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
    held.resolve(response({ ...testState.api.db.users[0], name: "Changed A" })),
  );
  assert.equal(query(".header__user-name").textContent, "Account B");
});

test("profile saves from reopened forms execute in order and preserve the new draft", async () => {
  const held = deferred();
  const requests = { patchCount: 0 };
  testState.api.intercept((call) => {
    if (call.path !== "/users/me" || call.method !== "PATCH") return;
    requests.patchCount += 1;
    if (requests.patchCount === 1)
      return held.promise.then(() => {
        Object.assign(testState.api.db.users[0], call.body);
        return response(testState.api.db.users[0]);
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
  assert.equal(requests.patchCount, 1);
  await settle(() => held.resolve());
  assert.equal(requests.patchCount, 2);
  assert.equal(testState.api.db.users[0].name, "Latest name");
  assert.equal(query(".header__user-name").textContent, "Latest name");
  assert.ok(query('[role="dialog"]') === null);
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
  testState.api.intercept((call) =>
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
  testState.api.intercept((call) =>
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
