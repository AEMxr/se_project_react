/** @jest-environment jsdom */
import { describe, expect, test } from "@jest/globals";
import { screen, waitFor, within } from "@testing-library/react";
import { start, logIn, profile, testState } from "../fixtures/appFlows.js";

describe("Authentication and protected navigation", () => {
  test("guests are redirected from profile and have no mutation controls", async () => {
    window.history.replaceState({}, "", "/profile");
    await start();
    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(
      screen.queryByRole("link", { name: /^Go to profile:/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /^Like / }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Add Clothes/ }),
    ).not.toBeInTheDocument();
  });

  test("registration logs in automatically and survives remounting", async () => {
    const view = await start();
    await testState.user.click(
      screen.getByRole("button", { name: "Sign Up", exact: true }),
    );
    const dialog = screen.getByRole("dialog", { name: "Sign Up" });
    for (const [label, value] of [
      [/^Email/, "new@example.com"],
      [/^Password/, "Password1!"],
      [/^Name/, "New User"],
      [/^Avatar/, "https://example.com/avatar.jpg"],
    ]) {
      await testState.user.type(within(dialog).getByLabelText(label), value);
    }
    await testState.user.click(
      within(dialog).getByRole("button", { name: "Sign Up", exact: true }),
    );
    expect(
      await screen.findByRole("link", { name: /^Go to profile:/ }),
    ).toHaveTextContent("New User");
    expect(localStorage.getItem("jwt")).toBeTruthy();
    view.unmount();
    await start();
    expect(
      await screen.findByRole("link", { name: /^Go to profile:/ }),
    ).toHaveTextContent("New User");
  });

  test("wrong credentials show a useful error and retain the draft", async () => {
    await start();
    await logIn("a@example.com", "WrongPassword1!");
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Incorrect email or password",
    );
    expect(screen.getByLabelText(/^Email/)).toHaveValue("a@example.com");
    expect(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Log In",
        exact: true,
      }),
    ).toBeEnabled();
  });

  test("invalid saved tokens return to the guest page", async () => {
    await start("invalid-token");
    await waitFor(() => expect(localStorage.getItem("jwt")).toBeNull());
    expect(
      screen.getByRole("button", { name: "Log In", exact: true }),
    ).toBeVisible();
  });

  test("each account sees only its own profile items, and logout clears the token", async () => {
    await start("token:account-a");
    await profile();
    expect(screen.getByRole("button", { name: "View Sweater" })).toBeVisible();
    expect(screen.getByRole("button", { name: "View Coat" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "View T-Shirt" }),
    ).not.toBeInTheDocument();
    await testState.user.click(screen.getByRole("button", { name: "Log out" }));
    expect(localStorage.getItem("jwt")).toBeNull();
    await logIn("b@example.com");
    await profile();
    expect(screen.getByRole("button", { name: "View T-Shirt" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "View Sweater" }),
    ).not.toBeInTheDocument();
  });
});
