/** @jest-environment jsdom */
import { describe, expect, test } from "@jest/globals";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import App from "../../src/components/App.jsx";
import { deferred, response } from "../fixtures/api.js";
import { logIn, profile, start, testState } from "../fixtures/appFlows.js";

const weather = {
  name: "Vancouver",
  main: { temp: 70 },
  weather: [{ main: "Clear" }],
  dt: 100,
  sys: { sunrise: 0, sunset: 200 },
};

describe("Independent loading regions", () => {
  test("a slow weather response leaves profile navigation and clothing usable", async () => {
    const held = deferred();
    testState.api.intercept((call) =>
      call.path === "/weather" ? held.promise : undefined,
    );
    localStorage.setItem("jwt", "token:account-a");
    const { container } = render(<App />);
    await screen.findByRole("link", { name: /^Go to profile:/ });
    expect(container.querySelector(".weather-card")).toHaveAttribute(
      "aria-busy",
      "true",
    );
    expect(container.querySelectorAll(".card_loading")).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /^View / })).toBeNull();
    await profile();
    expect(screen.getByRole("button", { name: "View Sweater" })).toBeVisible();
    expect(screen.getByRole("button", { name: "View Coat" })).toBeVisible();
    await testState.user.click(
      screen.getByRole("button", { name: "+ Add New" }),
    );
    expect(screen.getByRole("dialog", { name: "New garment" })).toBeVisible();
    await act(async () => held.resolve(response(weather)));
    expect(await screen.findByText(/Vancouver/)).toBeVisible();
  });

  test("a slow clothing response leaves weather, temperature controls and forms usable", async () => {
    const held = deferred();
    testState.api.intercept((call) =>
      call.path === "/items" && call.method === "GET"
        ? held.promise
        : undefined,
    );
    const { container } = render(<App />);
    await screen.findByText(/Vancouver/);
    expect(container.querySelectorAll(".card_loading")).toHaveLength(4);
    await testState.user.click(
      screen.getByRole("checkbox", { name: "Use Celsius" }),
    );
    expect(screen.getByText("21°C", { exact: true })).toBeVisible();
    await testState.user.click(
      screen.getByRole("button", { name: "Log In", exact: true }),
    );
    expect(screen.getByRole("dialog", { name: "Log In" })).toBeVisible();
    await testState.user.keyboard("{Escape}");
    await act(async () => held.resolve(response(testState.api.db.items)));
    await screen.findByRole("button", { name: "View Sweater" });
    expect(container.querySelector(".card_loading")).toBeNull();
    expect(container.querySelector(".main__card-list")).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  test("failed collection requests clear skeletons and keep visible retry guidance", async () => {
    const held = deferred();
    testState.api.intercept((call) =>
      call.path === "/items" ? held.promise : undefined,
    );
    const { container } = render(<App />);
    await screen.findByText(/Vancouver/);
    expect(container.querySelectorAll(".card_loading")).toHaveLength(4);
    await act(async () => held.resolve(response({ message: "Offline" }, 503)));
    expect(
      await screen.findByText(/Clothing items could not be loaded/),
    ).toBeVisible();
    expect(container.querySelector(".card_loading")).toBeNull();
    expect(container.querySelector(".main__card-list")).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  test("slow garment images do not block likes, previews or closing the dialog", async () => {
    await start();
    await logIn();
    await screen.findByRole("link", { name: /^Go to profile:/ });
    expect(screen.getAllByText("Loading image...").length).toBeGreaterThan(0);
    const like = screen.getByRole("button", { name: "Like Sweater" });
    await testState.user.click(like);
    await waitFor(() => expect(like).toHaveAttribute("aria-pressed", "true"));
    await testState.user.click(
      screen.getByRole("button", { name: "View Sweater" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Sweater" });
    expect(within(dialog).getByText("Loading image...")).toBeVisible();
    expect(within(dialog).getByText("Weather: warm")).toBeVisible();
    await testState.user.click(
      within(dialog).getByRole("button", { name: "Close" }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
