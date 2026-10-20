/** @jest-environment jsdom */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/components/App.jsx";
import { REQUEST_TIMEOUT_MS } from "../../src/utils/constants.js";
import { deferred, response } from "../fixtures/api.js";
import {
  fillGarment,
  logIn,
  profile,
  start,
  testState,
} from "../fixtures/appFlows.js";

beforeEach(() => {
  jest.useFakeTimers();
  testState.user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
});
afterEach(() => jest.useRealTimers());
const advance = (time = 0) =>
  act(async () => jest.advanceTimersByTimeAsync(time));
const count = (path, method = "GET") =>
  testState.api.calls.filter(
    (call) => call.path === path && call.method === method,
  ).length;

describe("Request timeout recovery", () => {
  test("weather can be retried independently and late timed-out results cannot replace it", async () => {
    const held = deferred();
    testState.api.intercept(({ path }) =>
      path === "/weather" ? held.promise : undefined,
    );
    const { container } = render(<App />);
    await advance();
    await advance(REQUEST_TIMEOUT_MS);
    expect(screen.getByText(/Weather is unavailable/)).toHaveTextContent(
      "The request took too long",
    );
    expect(container.querySelector(".card_loading")).toBeNull();
    expect(container.querySelector(".weather-card")).toHaveAttribute(
      "aria-busy",
      "false",
    );
    testState.api.intercept(() => undefined);
    await testState.user.dblClick(
      screen.getByRole("button", { name: "Retry weather" }),
    );
    expect(await screen.findByText(/Vancouver/)).toBeVisible();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("70°F");
    expect(screen.queryByRole("button", { name: "Retry weather" })).toBeNull();
    expect(count("/weather")).toBe(2);
    expect(count("/items")).toBe(1);
    await act(async () =>
      held.resolve(response({ name: "Old city", main: { temp: 100 } })),
    );
    expect(screen.queryByText(/Old city/)).toBeNull();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("70°F");
  });

  test("retrying clothing preserves garments and likes created during that request", async () => {
    const initial = deferred();
    const retry = deferred();
    const snapshot = structuredClone(testState.api.db.items);
    testState.api.intercept(({ path, method }) =>
      path === "/items" && method === "GET" ? initial.promise : undefined,
    );
    localStorage.setItem("jwt", "token:account-a");
    render(<App />);
    await advance();
    await advance(REQUEST_TIMEOUT_MS);
    expect(
      screen.getByText(/Clothing items could not be loaded/),
    ).toHaveTextContent("The request took too long");
    await profile();
    expect(screen.queryByText(/start your wardrobe/)).toBeNull();
    testState.api.intercept(({ path, method }) =>
      path === "/items" && method === "GET" ? retry.promise : undefined,
    );
    await testState.user.dblClick(
      screen.getByRole("button", { name: "Retry clothing" }),
    );
    expect(screen.queryByRole("button", { name: "Retry clothing" })).toBeNull();
    expect(count("/items")).toBe(2);
    await testState.user.click(
      screen.getByRole("button", { name: "+ Add New" }),
    );
    const dialog = await fillGarment("New sweater");
    await testState.user.click(
      within(dialog).getByRole("button", { name: "Add garment" }),
    );
    expect(
      await screen.findByRole("button", { name: "View New sweater" }),
    ).toBeVisible();
    await testState.user.click(
      screen.getByRole("button", { name: "Like New sweater" }),
    );
    expect(
      await screen.findByRole("button", { name: "Unlike New sweater" }),
    ).toHaveAttribute("aria-pressed", "true");
    await act(async () => retry.resolve(response(snapshot)));
    expect(
      screen.getByRole("button", { name: "View New sweater" }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", { name: "Unlike New sweater" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "View Sweater" })).toBeVisible();
    expect(count("/weather")).toBe(1);
    await act(async () => initial.resolve(response([])));
    expect(screen.getByRole("button", { name: "View Sweater" })).toBeVisible();
  });

  test("login timeouts release the form, retain its draft, and do not automatically resend", async () => {
    const held = deferred();
    testState.api.intercept(({ path }) =>
      path === "/signin" ? held.promise : undefined,
    );
    await start();
    await logIn();
    expect(
      screen.getByRole("button", { name: "Logging in..." }),
    ).toBeDisabled();
    await advance(REQUEST_TIMEOUT_MS);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The request took too long",
    );
    expect(screen.getByLabelText(/^Email/)).toHaveValue("a@example.com");
    expect(screen.getByLabelText(/^Password/)).toHaveValue("Password1!");
    const dialog = screen.getByRole("dialog", { name: "Log In" });
    const submit = within(dialog).getByRole("button", {
      name: "Log In",
      exact: true,
    });
    expect(submit).toBeEnabled();
    await advance(REQUEST_TIMEOUT_MS * 2);
    expect(count("/signin", "POST")).toBe(1);
    testState.api.intercept(() => undefined);
    await testState.user.click(submit);
    expect(
      await screen.findByRole("link", { name: /^Go to profile:/ }),
    ).toBeVisible();
    expect(count("/signin", "POST")).toBe(2);
    await act(async () => held.resolve(response({ token: "token:account-b" })));
    expect(localStorage.getItem("jwt")).toBe("token:account-a");
  });

  test("a deletion timeout unlocks confirmation dismissal without automatically deleting again", async () => {
    testState.api.intercept(({ method }) =>
      method === "DELETE" ? deferred().promise : undefined,
    );
    await start("token:account-a");
    await testState.user.click(
      screen.getByRole("button", { name: "View Sweater" }),
    );
    await testState.user.click(
      screen.getByRole("button", { name: "Delete item" }),
    );
    await testState.user.click(
      screen.getByRole("button", { name: "Yes, delete item" }),
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    await advance(REQUEST_TIMEOUT_MS);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "The request took too long",
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeEnabled();
    expect(count("/items/a-warm", "DELETE")).toBe(1);
    await testState.user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.getByRole("button", { name: "View Sweater" })).toBeVisible();
  });

  test("a verification timeout releases the protected route and retains the token for later login", async () => {
    testState.api.intercept(({ path }) =>
      path === "/users/me" ? deferred().promise : undefined,
    );
    localStorage.setItem("jwt", "token:account-a");
    window.history.replaceState({}, "", "/profile");
    render(<App />);
    await advance();
    await advance(REQUEST_TIMEOUT_MS);
    expect(
      screen.getByText(/Your session could not be verified/),
    ).toBeVisible();
    expect(window.location.pathname).toBe("/");
    expect(localStorage.getItem("jwt")).toBe("token:account-a");
    expect(
      screen.getByRole("button", { name: "Log In", exact: true }),
    ).toBeEnabled();
  });
});
