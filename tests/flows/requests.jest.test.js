/** @jest-environment jsdom */
import { describe, expect, test } from "@jest/globals";
import { act, screen, within } from "@testing-library/react";
import { deferred, response } from "../fixtures/api.js";
import { start, logIn, fillGarment, testState } from "../fixtures/appFlows.js";

describe("Async failures and stale responses", () => {
  test("network failures retain editable input for retry", async () => {
    testState.api.intercept(({ path }) =>
      path === "/signin" ? Promise.reject(new TypeError("Offline")) : undefined,
    );
    await start();
    await logIn();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to reach the server",
    );
    expect(screen.getByLabelText(/^Email/)).toHaveValue("a@example.com");
  });

  test("an expired session clears login and closes the current form", async () => {
    testState.api.intercept(({ path, method }) =>
      path === "/items" && method === "POST"
        ? response({ message: "Unauthorized" }, 401)
        : undefined,
    );
    await start("token:account-a");
    await testState.user.click(
      await screen.findByRole("button", { name: /Add Clothes/ }),
    );
    const dialog = await fillGarment();
    await testState.user.click(
      within(dialog).getByRole("button", { name: "Add garment" }),
    );
    expect(
      await screen.findByText("Your session expired. Please log in again."),
    ).toBeVisible();
    expect(localStorage.getItem("jwt")).toBeNull();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("closing a pending login prevents late authentication", async () => {
    const held = deferred();
    testState.api.intercept(({ path }) =>
      path === "/signin" ? held.promise : undefined,
    );
    await start();
    await logIn();
    await testState.user.keyboard("{Escape}");
    await act(async () => held.resolve(response({ token: "token:account-a" })));
    expect(localStorage.getItem("jwt")).toBeNull();
    expect(
      screen.queryByRole("link", { name: /^Go to profile:/ }),
    ).not.toBeInTheDocument();
  });

  test("a late garment response cannot close a reopened form", async () => {
    const held = deferred();
    testState.api.intercept(({ path, method }) =>
      path === "/items" && method === "POST" ? held.promise : undefined,
    );
    await start("token:account-a");
    await testState.user.click(
      await screen.findByRole("button", { name: /Add Clothes/ }),
    );
    const dialog = await fillGarment();
    await testState.user.click(
      within(dialog).getByRole("button", { name: "Add garment" }),
    );
    await testState.user.keyboard("{Escape}");
    await testState.user.click(
      screen.getByRole("button", { name: /Add Clothes/ }),
    );
    await testState.user.type(
      screen.getByLabelText("Name", { exact: true }),
      "New draft",
    );
    await act(async () =>
      held.resolve(
        response({
          _id: "late",
          name: "Old garment",
          weather: "warm",
          owner: "account-a",
          imageUrl: "https://example.com/old.jpg",
          likes: [],
        }),
      ),
    );
    expect(screen.getByRole("dialog", { name: "New garment" })).toBeVisible();
    expect(screen.getByLabelText("Name", { exact: true })).toHaveValue(
      "New draft",
    );
  });

  test("failed initial loading reports an error without empty-wardrobe advice", async () => {
    testState.api.intercept(({ path, method }) =>
      path === "/items" && method === "GET"
        ? Promise.reject(new TypeError("Offline"))
        : undefined,
    );
    await start();
    expect(
      await screen.findByText(/Clothing items could not be loaded/),
    ).toBeVisible();
    expect(screen.queryByText(/garments yet/)).not.toBeInTheDocument();
  });

  test("like failures preserve the previous state and allow retry", async () => {
    testState.api.intercept(({ path }) =>
      path.endsWith("/likes")
        ? response({ message: "Please retry the like" }, 500)
        : undefined,
    );
    await start("token:account-a");
    await testState.user.click(
      await screen.findByRole("button", { name: "Like Sweater" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please retry the like",
    );
    expect(screen.getByRole("button", { name: "Like Sweater" })).toBeEnabled();
    testState.api.intercept(() => undefined);
    await testState.user.click(
      screen.getByRole("button", { name: "Like Sweater" }),
    );
    expect(
      await screen.findByRole("button", { name: "Unlike Sweater" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("pending deletion locks dismissal and failure unlocks retry", async () => {
    const held = deferred();
    testState.api.intercept(({ method }) =>
      method === "DELETE" ? held.promise : undefined,
    );
    await start("token:account-a");
    await testState.user.click(
      screen.getByRole("button", { name: "View Sweater" }),
    );
    await testState.user.click(
      screen.getByRole("button", { name: "Delete item" }),
    );
    await testState.user.dblClick(
      screen.getByRole("button", { name: "Yes, delete item" }),
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    await testState.user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(
      testState.api.calls.filter((call) => call.method === "DELETE"),
    ).toHaveLength(1);
    await testState.user.tab();
    expect(screen.getByRole("dialog")).toHaveFocus();
    await act(async () =>
      held.resolve(response({ message: "Delete failed" }, 500)),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("Delete failed");
    expect(
      screen.getByRole("button", { name: "Yes, delete item" }),
    ).toBeEnabled();
  });

  test("verification network errors retain a saved token for later recovery", async () => {
    testState.api.intercept(({ path }) =>
      path === "/users/me"
        ? Promise.reject(new TypeError("Offline"))
        : undefined,
    );
    await start("token:account-a");
    expect(
      await screen.findByText(/Your session could not be verified/),
    ).toBeVisible();
    expect(localStorage.getItem("jwt")).toBe("token:account-a");
  });
});
