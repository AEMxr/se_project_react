import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { handleResponse } from "../src/utils/request.js";
import {
  getItems,
  createItem,
  removeItem,
  toggleItemLike,
  updateCurrentUser,
} from "../src/utils/api.js";
import { signIn, signUp, getCurrentUser } from "../src/utils/auth.js";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const response = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

test("response errors preserve backend messages and statuses, including malformed JSON fallback", async () => {
  await assert.rejects(
    handleResponse(
      Promise.resolve(
        response(409, { message: "Email is already registered" }),
      ),
    ),
    (error) =>
      error.status === 409 && error.message === "Email is already registered",
  );
  await assert.rejects(
    handleResponse(
      Promise.resolve({
        ...response(500),
        json: async () => {
          throw new SyntaxError();
        },
      }),
    ),
    (error) =>
      error.status === 500 && error.message.includes("Please try again"),
  );
  assert.equal(await handleResponse(Promise.resolve(response(204))), null);
  assert.deepEqual(
    await handleResponse(Promise.resolve(response(200, []))),
    [],
  );
});

test("public endpoints omit tokens and protected endpoints include Bearer authorization", async () => {
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), ...options });
    return response(200, {});
  };
  await getItems();
  await signIn({ email: "user@example.com", password: "password" });
  await signUp({
    name: "User",
    email: "user@example.com",
    password: "password",
    avatar: "https://example.com/a.jpg",
  });
  await getCurrentUser("jwt");
  await createItem(
    { name: "Sweater", image: "https://example.com/s.jpg", weather: "warm" },
    "jwt",
  );
  await updateCurrentUser(
    { name: "Updated", avatar: "https://example.com/a.jpg" },
    "jwt",
  );
  await toggleItemLike("item/id", false, "jwt");
  await toggleItemLike("item/id", true, "jwt");
  await removeItem("item/id", "jwt");
  for (const call of calls.slice(0, 3))
    assert.equal(call.headers?.Authorization, undefined);
  for (const call of calls.slice(3))
    assert.equal(call.headers.Authorization, "Bearer jwt");
  assert.deepEqual(
    calls.slice(6).map(({ method }) => method),
    ["PUT", "DELETE", "DELETE"],
  );
  assert.ok(calls[6].url.endsWith("/items/item%2Fid/likes"));
  assert.deepEqual(JSON.parse(calls[4].body), {
    name: "Sweater",
    imageUrl: "https://example.com/s.jpg",
    weather: "warm",
  });
});

test("network rejection propagates without fabricating an HTTP status", async () => {
  const offline = new TypeError("Failed to fetch");
  await assert.rejects(
    handleResponse(Promise.reject(offline)),
    (error) => error === offline && error.status === undefined,
  );
});
