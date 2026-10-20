/** @jest-environment jsdom */
import { describe, expect, test } from "@jest/globals";
import { screen, waitFor, within } from "@testing-library/react";
import { response } from "../fixtures/api.js";
import {
  start,
  profile,
  fillGarment,
  testState,
} from "../fixtures/appFlows.js";

describe("Profile editing and garments", () => {
  test("server validation errors explain the field and keep the garment draft for correction", async () => {
    await start("token:account-a");
    testState.api.intercept((call) =>
      call.path === "/items" && call.method === "POST"
        ? response(
            {
              message: "Validation failed",
              validation: {
                body: {
                  source: "body",
                  keys: ["imageUrl"],
                  message: '"imageUrl" must be a valid HTTP or HTTPS image URL',
                },
              },
            },
            400,
          )
        : undefined,
    );
    await testState.user.click(
      await screen.findByRole("button", { name: /Add Clothes/ }),
    );
    const dialog = await fillGarment();
    await testState.user.click(
      within(dialog).getByRole("button", { name: "Add garment" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      '"imageUrl" must be a valid HTTP or HTTPS image URL',
    );
    expect(within(dialog).getByLabelText("Name", { exact: true })).toHaveValue(
      "New sweater",
    );
    expect(within(dialog).getByLabelText("Image", { exact: true })).toHaveValue(
      "https://example.com/new.jpg",
    );
    expect(
      within(dialog).getByRole("button", { name: "Add garment" }),
    ).toBeEnabled();
    expect(localStorage.getItem("jwt")).toBe("token:account-a");
    expect(testState.api.db.items).toHaveLength(3);
    testState.api.intercept(() => undefined);
    await testState.user.click(
      within(dialog).getByRole("button", { name: "Add garment" }),
    );
    expect(
      await screen.findByRole("button", { name: "View New sweater" }),
    ).toBeVisible();
  });

  test("profile edits start with current values and persist through reload", async () => {
    const view = await start("token:account-a");
    await profile();
    await testState.user.click(
      screen.getByRole("button", { name: "Change profile data" }),
    );
    const name = screen.getByLabelText(/^Name/);
    expect(name).toHaveValue("Account A");
    expect(screen.getByLabelText(/^Avatar/)).toHaveValue(
      "https://example.com/a.jpg",
    );
    await testState.user.clear(name);
    await testState.user.type(name, "Updated Account");
    await testState.user.click(
      screen.getByRole("button", { name: "Save changes" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(testState.api.db.users[0].name).toBe("Updated Account");
    view.unmount();
    await start();
    expect(
      await screen.findByRole("link", { name: "Go to profile" }),
    ).toHaveTextContent("Updated Account");
  });

  test("URL-only garment creation updates the grid and survives reload", async () => {
    const view = await start("token:account-a");
    await testState.user.click(
      await screen.findByRole("button", { name: /Add Clothes/ }),
    );
    const dialog = await fillGarment("  New sweater  ");
    expect(
      within(dialog).getByLabelText("Image", { exact: true }),
    ).toHaveAttribute("type", "url");
    expect(
      dialog.querySelector('input[type="file"], [name="color"]'),
    ).toBeNull();
    await testState.user.click(
      within(dialog).getByRole("button", { name: "Add garment" }),
    );
    expect(
      await screen.findByRole("button", { name: "View New sweater" }),
    ).toBeVisible();
    expect(testState.api.db.items[0]).toMatchObject({
      name: "New sweater",
      weather: "warm",
      owner: "account-a",
    });
    view.unmount();
    await start();
    expect(
      await screen.findByRole("button", { name: "View New sweater" }),
    ).toBeVisible();
  });

  test("likes and unlikes are synchronized across routes and reloads", async () => {
    const view = await start("token:account-a");
    await testState.user.click(
      await screen.findByRole("button", { name: "Like Sweater" }),
    );
    expect(
      await screen.findByRole("button", { name: "Unlike Sweater" }),
    ).toHaveAttribute("aria-pressed", "true");
    await profile();
    await testState.user.click(
      screen.getByRole("button", { name: "Unlike Sweater" }),
    );
    expect(
      await screen.findByRole("button", { name: "Like Sweater" }),
    ).toHaveAttribute("aria-pressed", "false");
    view.unmount();
    await start();
    expect(
      await screen.findByRole("button", { name: "Like Sweater" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("deletion is owner-only, cancellable, and removes the saved item", async () => {
    await start("token:account-a");
    await testState.user.click(
      screen.getByRole("button", { name: "View T-Shirt" }),
    );
    expect(
      screen.queryByRole("button", { name: "Delete item" }),
    ).not.toBeInTheDocument();
    await testState.user.keyboard("{Escape}");
    await testState.user.click(
      screen.getByRole("button", { name: "View Sweater" }),
    );
    await testState.user.click(
      screen.getByRole("button", { name: "Delete item" }),
    );
    await testState.user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(testState.api.db.items.some((item) => item._id === "a-warm")).toBe(
      true,
    );
    await testState.user.click(
      screen.getByRole("button", { name: "View Sweater" }),
    );
    await testState.user.click(
      screen.getByRole("button", { name: "Delete item" }),
    );
    await testState.user.click(
      screen.getByRole("button", { name: "Yes, delete item" }),
    );
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "View Sweater" }),
    ).not.toBeInTheDocument();
    expect(testState.api.db.items.some((item) => item._id === "a-warm")).toBe(
      false,
    );
  });
});
