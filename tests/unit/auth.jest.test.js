import { describe, expect, test } from "@jest/globals";
import { signIn, signUp, getCurrentUser } from "../../src/utils/auth.js";
import { jsonResponse } from "../fixtures/response.js";

const base = "http://localhost:3001";
const credentials = { email: "user@example.com", password: " Password1! " };

describe("signIn", () => {
  test("sends credentials publicly and returns the token", async () => {
    fetch.mockResolvedValue(jsonResponse({ token: "fixture-token" }));
    await expect(signIn({ ...credentials, name: "ignored" })).resolves.toEqual({
      token: "fixture-token",
    });
    expect(fetch).toHaveBeenCalledWith(`${base}/signin`, {
      signal: expect.any(AbortSignal),
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
  });
  test("returns a 401 error for incorrect credentials", async () => {
    fetch.mockResolvedValue(
      jsonResponse({ message: "Incorrect email or password" }, 401),
    );
    await expect(signIn(credentials)).rejects.toMatchObject({
      status: 401,
      message: "Incorrect email or password",
    });
  });
});

describe("signUp", () => {
  test("posts exactly the registration fields without authentication", async () => {
    const values = {
      ...credentials,
      name: "New User",
      avatar: "https://example.com/avatar.jpg",
    };
    fetch.mockResolvedValue(jsonResponse({ _id: "new-user" }, 201));
    await expect(signUp({ ...values, role: "admin" })).resolves.toEqual({
      _id: "new-user",
    });
    expect(fetch).toHaveBeenCalledWith(`${base}/signup`, {
      signal: expect.any(AbortSignal),
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
  });
  test("retains the duplicate-email response", async () => {
    fetch.mockResolvedValue(jsonResponse({ message: "Duplicate key" }, 409));
    await expect(signUp(credentials)).rejects.toMatchObject({
      status: 409,
      message: "Duplicate key",
    });
  });
});

describe("getCurrentUser", () => {
  test("sends the token and cancellation signal", async () => {
    const controller = new AbortController();
    const user = { _id: "user", name: "User" };
    fetch.mockResolvedValue(jsonResponse(user));
    await expect(
      getCurrentUser("fixture-token", { signal: controller.signal }),
    ).resolves.toEqual(user);
    expect(fetch).toHaveBeenCalledWith(`${base}/users/me`, {
      signal: expect.any(AbortSignal),
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer fixture-token",
      },
    });
  });
  test("works without a cancellation option", async () => {
    fetch.mockResolvedValue(jsonResponse({ _id: "user" }));
    await getCurrentUser("fixture-token");
    expect(fetch.mock.calls[0][1].signal).toBeInstanceOf(AbortSignal);
  });
  test("preserves network rejection", async () => {
    const error = new TypeError("Offline");
    fetch.mockRejectedValue(error);
    await expect(getCurrentUser("fixture-token")).rejects.toBe(error);
  });
});
