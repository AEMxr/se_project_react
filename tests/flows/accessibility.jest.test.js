/** @jest-environment jsdom */
import { describe, expect, test } from "@jest/globals";
import { fireEvent, screen, within } from "@testing-library/react";
import { start, profile, testState } from "../fixtures/appFlows.js";

describe("Accessibility and weather interactions", () => {
  test("dialogs focus inputs, close with Escape, and return focus", async () => {
    await start();
    const trigger = screen.getByRole("button", { name: "Log In", exact: true });
    await testState.user.click(trigger);
    expect(screen.getByLabelText(/^Email/)).toHaveFocus();
    await testState.user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("Tab and Shift+Tab wrap focus inside the dialog", async () => {
    await start();
    await testState.user.click(
      screen.getByRole("button", { name: "Log In", exact: true }),
    );
    const dialog = screen.getByRole("dialog");
    const close = within(dialog).getByRole("button", { name: "Close" });
    close.focus();
    await testState.user.tab({ shift: true });
    expect(
      within(dialog).getByRole("button", { name: "or Sign Up" }),
    ).toHaveFocus();
    await testState.user.tab();
    expect(close).toHaveFocus();
  });

  test("blurred invalid fields expose validation feedback and block submission", async () => {
    await start();
    await testState.user.click(
      screen.getByRole("button", { name: "Sign Up", exact: true }),
    );
    const email = screen.getByLabelText(/^Email/);
    await testState.user.type(email, "invalid-email");
    await testState.user.tab();
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("Enter a valid email address.")).toBeVisible();
    expect(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Sign Up",
        exact: true,
      }),
    ).toBeDisabled();
  });

  test("temperature units change together in the heading and weather card", async () => {
    await start();
    await testState.user.click(
      screen.getByRole("checkbox", { name: "Use Celsius" }),
    );
    expect(
      screen.getByRole("heading", { name: /Today is 21°C/ }),
    ).toBeVisible();
    expect(screen.getByText("21°C", { exact: true })).toBeVisible();
  });

  test("randomization selects only weather-appropriate garments", async () => {
    await start();
    await testState.user.click(
      screen.getByRole("button", { name: "Randomize" }),
    );
    expect(screen.getAllByRole("button", { name: /^View / })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "View T-Shirt" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "View Coat" }),
    ).not.toBeInTheDocument();
  });

  test("randomization still displays an item when no outfit category is selected", async () => {
    testState.api.db.items = testState.api.db.items.filter(
      (item) => item._id === "a-warm",
    );
    await start();
    await testState.user.click(
      screen.getByRole("button", { name: "Randomize" }),
    );
    expect(screen.getByRole("button", { name: "View Sweater" })).toBeVisible();
  });

  test("an empty profile still allows adding a first garment", async () => {
    testState.api.db.items = [];
    await start("token:account-a");
    await profile();
    expect(
      screen.queryByRole("button", { name: /^View / }),
    ).not.toBeInTheDocument();
    await testState.user.click(
      screen.getByRole("button", { name: "+ Add New" }),
    );
    expect(screen.getByRole("dialog", { name: "New garment" })).toBeVisible();
  });

  test("authenticated mobile navigation opens profile and the add form", async () => {
    await start("token:account-a");
    await screen.findByRole("link", { name: /^Go to profile:/ });
    await testState.user.click(
      screen.getByRole("button", { name: "Open menu" }),
    );
    await testState.user.click(
      within(screen.getByRole("dialog")).getByRole("link"),
    );
    expect(
      await screen.findByRole("heading", { name: "Your profile" }),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await testState.user.click(
      screen.getByRole("button", { name: "Open menu" }),
    );
    await testState.user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /Add Clothes/,
      }),
    );
    expect(screen.getByRole("dialog", { name: "New garment" })).toBeVisible();
  });

  test("keyboard activation opens a card preview", async () => {
    await start();
    screen.getByRole("button", { name: "View Sweater" }).focus();
    await testState.user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "Sweater" })).toBeVisible();
  });

  test("mobile guest actions switch to the correct auth dialog", async () => {
    await start();
    await testState.user.click(
      screen.getByRole("button", { name: "Open menu" }),
    );
    await testState.user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Sign Up",
        exact: true,
      }),
    );
    expect(screen.getByRole("dialog", { name: "Sign Up" })).toBeVisible();
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  test("broken avatars show the account initial", async () => {
    await start("token:account-a");
    const avatar = await screen.findByRole("img", { name: "Account A avatar" });
    fireEvent.error(avatar);
    expect(screen.getByText("A")).toBeVisible();
  });

  test("no matching garments leaves the clothing area blank", async () => {
    testState.api.db.items = testState.api.db.items.filter(
      (item) => item.weather === "cold",
    );
    await start();
    expect(
      screen.queryByRole("button", { name: /^View / }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/garments yet|Add one with this weather/),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Randomize" })).toBeDisabled();
  });
});
