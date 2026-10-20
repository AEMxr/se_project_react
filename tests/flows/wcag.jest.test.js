/** @jest-environment jsdom */
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { screen } from "@testing-library/react";
import axe from "axe-core";
import { profile, start, testState } from "../fixtures/appFlows.js";

beforeEach(() => {
  document.documentElement.lang = "en";
  document.title = "WTWR°";
  // jsdom has no canvas; axe treats a null context as unavailable graphics.
  jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
});

async function checkAccessibility() {
  const report = await axe.run(document.body, {
    runOnly: {
      type: "tag",
      values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
    },
    // jsdom has no layout; contrast is checked separately in a real browser.
    rules: { "color-contrast": { enabled: false } },
  });
  expect(
    report.violations.map(({ id, nodes }) => ({
      id,
      targets: nodes.map(({ target }) => target),
    })),
  ).toEqual([]);
}

describe("Automated WCAG checks", () => {
  test("guest recommendations", async () => {
    await start();
    await checkAccessibility();
  });

  test.each(["Log In", "Sign Up"])("the %s form", async (name) => {
    await start();
    await testState.user.click(
      screen.getByRole("button", { name, exact: true }),
    );
    await checkAccessibility();
  });

  test("invalid fields keep their associated error text", async () => {
    await start();
    await testState.user.click(
      screen.getByRole("button", { name: "Sign Up", exact: true }),
    );
    await testState.user.type(screen.getByLabelText(/^Email/), "invalid");
    await testState.user.tab();
    await checkAccessibility();
  });

  test("the authenticated profile", async () => {
    await start("token:account-a");
    await profile();
    await checkAccessibility();
  });

  test.each(["Change profile data", "+ Add New"])(
    "the profile's %s form",
    async (name) => {
      await start("token:account-a");
      await profile();
      await testState.user.click(screen.getByRole("button", { name }));
      await checkAccessibility();
    },
  );

  test("item preview and deletion confirmation", async () => {
    await start("token:account-a");
    await screen.findByRole("link", { name: /^Go to profile:/ });
    await testState.user.click(
      screen.getByRole("button", { name: "View Sweater" }),
    );
    await checkAccessibility();
    await testState.user.click(
      screen.getByRole("button", { name: "Delete item" }),
    );
    await checkAccessibility();
  });

  test("the mobile menu", async () => {
    await start();
    await testState.user.click(
      screen.getByRole("button", { name: "Open menu" }),
    );
    await checkAccessibility();
  });
});
