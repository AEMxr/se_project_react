/** @jest-environment jsdom */
import { describe, expect, test } from "@jest/globals";
import { screen } from "@testing-library/react";
import { profile, start, testState } from "../fixtures/appFlows.js";

describe("Skip repeated navigation", () => {
  test("the profile link includes the visible name in its accessible name", async () => {
    await start("token:account-a");
    const link = await screen.findByRole("link", { name: /^Go to profile/ });
    expect(link).toHaveAccessibleName("Go to profile: Account A");
  });

  test("the first keyboard link moves focus to main content without changing the route", async () => {
    await start();
    await testState.user.tab();
    const skip = screen.getByRole("link", { name: "Skip to main content" });
    expect(skip).toHaveFocus();
    const route = window.location.href;

    await testState.user.keyboard("{Enter}");

    expect(screen.getByRole("main")).toHaveFocus();
    expect(window.location.href).toBe(route);
  });

  test("the same link reaches profile content without navigating away", async () => {
    await start("token:account-a");
    await profile();
    const route = window.location.href;

    await testState.user.click(
      screen.getByRole("link", { name: "Skip to main content" }),
    );

    expect(screen.getByRole("main")).toHaveFocus();
    expect(window.location.href).toBe(route);
  });
});
