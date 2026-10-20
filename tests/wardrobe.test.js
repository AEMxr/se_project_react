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
  App,
  testState,
} from "./fixtures/nodeApp.js";

test("course recommendations show matching garments from every account without optional filters", async () => {
  localStorage.setItem("jwt", "token:account-a");
  testState.api.db.items[1].condition = ["Rain"];
  testState.api.db.items[1].color = "red";
  await mount(App);
  assert.deepEqual(
    all(".card__title").map((title) => title.textContent),
    ["Sweater", "T-Shirt"],
  );
});

test("no matching garments leaves the main clothing area empty", async () => {
  testState.api.db.items[0].weather = "cold";
  testState.api.db.items[1].weather = "hot";
  await mount(App);
  assert.equal(all(".card").length, 0);
  assert.equal(query(".main__status"), null);
  assert.equal(query(".main__randomize-button").disabled, true);
});

test("failed item loading shows a request error without an empty-wardrobe message", async () => {
  localStorage.setItem("jwt", "token:account-a");
  testState.api.intercept(({ path, method }) =>
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
  assert.equal(testState.api.db.items[0].name, "New sweater");
  assert.equal(testState.api.db.items[0].owner, "account-a");
  assert.equal(all(".card").length, 3);
  const token = localStorage.getItem("jwt");
  await cleanup();
  localStorage.setItem("jwt", token);
  await mount(App);
  assert.equal(all(".card").length, 3);
});

test("initial GET arriving after creation cannot erase the new garment", async () => {
  const held = deferred();
  const snapshot = structuredClone(testState.api.db.items);
  testState.api.intercept((call) =>
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
  testState.api.intercept((call) => {
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
  await settle(() =>
    loading.resolve(response([item, ...testState.api.db.items])),
  );
  await settle(() => creation.resolve(response(item, 201)));
  assert.equal(
    all(".card__title").filter((entry) => entry.textContent === "New sweater")
      .length,
    1,
  );
});

test("old add success cannot close or erase a reopened form", async () => {
  const held = deferred();
  testState.api.intercept((call) =>
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

test("delete confirmation is guarded, and failure permits retry", async () => {
  const held = deferred();
  const requests = { deletes: 0 };
  testState.api.intercept((call) => {
    if (call.method === "DELETE" && !call.path.endsWith("/likes")) {
      requests.deletes += 1;
      return held.promise;
    }
  });
  await mount(App);
  await login();
  await click(".card__preview");
  await click(".item-modal__delete");
  await click(".modal__confirm");
  await settle(() => {
    query(".modal__confirm").click();
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
  });
  assert.equal(requests.deletes, 1);
  assert.ok(query('[role="dialog"]') !== null);
  assert.equal(query(".modal__cancel").matches(":disabled"), true);
  await settle(() => held.resolve(response({ message: "Try again" }, 500)));
  assert.equal(query(".modal__error").textContent, "Try again");
  assert.equal(query(".modal__confirm").matches(":disabled"), false);
  testState.api.intercept(() => undefined);
  await click(".modal__confirm");
  assert.equal(
    testState.api.db.items.some((item) => item._id === "a-warm"),
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
