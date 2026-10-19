/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { beforeEach, describe, expect, test } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/components/App.jsx";
import { fixture, deferred, response } from "../fixtures/api.js";

let api;
let user;
beforeEach(() => {
  api = fixture();
  fetch.mockImplementation(api.fetch);
  user = userEvent.setup();
});

async function start(token) {
  if (token) localStorage.setItem("jwt", token);
  const view = render(<App />);
  await screen.findByText(/Vancouver/);
  await waitFor(() =>
    expect(
      screen.queryByText("Loading clothing items..."),
    ).not.toBeInTheDocument(),
  );
  return view;
}

async function logIn(email = "a@example.com", password = "Password1!") {
  await user.click(screen.getByRole("button", { name: "Log In", exact: true }));
  const dialog = screen.getByRole("dialog", { name: "Log In" });
  await user.type(within(dialog).getByLabelText(/^Email/), email);
  await user.type(within(dialog).getByLabelText(/^Password/), password);
  await user.click(
    within(dialog).getByRole("button", { name: "Log In", exact: true }),
  );
}

async function profile() {
  await user.click(await screen.findByRole("link", { name: "Go to profile" }));
  await screen.findByRole("heading", { name: "Your profile" });
}

async function fillGarment(name = "New sweater") {
  const dialog = screen.getByRole("dialog", { name: "New garment" });
  await user.type(within(dialog).getByLabelText("Name", { exact: true }), name);
  await user.type(
    within(dialog).getByLabelText("Image", { exact: true }),
    "https://example.com/new.jpg",
  );
  return dialog;
}

describe("Authentication and protected navigation", () => {
  test("guests are redirected from profile and have no mutation controls", async () => {
    window.history.replaceState({}, "", "/profile");
    await start();
    await waitFor(() => expect(window.location.pathname).toBe("/"));
    expect(
      screen.queryByRole("link", { name: "Go to profile" }),
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
    await user.click(
      screen.getByRole("button", { name: "Sign Up", exact: true }),
    );
    const dialog = screen.getByRole("dialog", { name: "Sign Up" });
    for (const [label, value] of [
      [/^Email/, "new@example.com"],
      [/^Password/, "Password1!"],
      [/^Name/, "New User"],
      [/^Avatar/, "https://example.com/avatar.jpg"],
    ]) {
      await user.type(within(dialog).getByLabelText(label), value);
    }
    await user.click(
      within(dialog).getByRole("button", { name: "Sign Up", exact: true }),
    );
    expect(
      await screen.findByRole("link", { name: "Go to profile" }),
    ).toHaveTextContent("New User");
    expect(localStorage.getItem("jwt")).toBeTruthy();
    view.unmount();
    await start();
    expect(
      await screen.findByRole("link", { name: "Go to profile" }),
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
    await user.click(screen.getByRole("button", { name: "Log out" }));
    expect(localStorage.getItem("jwt")).toBeNull();
    await logIn("b@example.com");
    await profile();
    expect(screen.getByRole("button", { name: "View T-Shirt" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "View Sweater" }),
    ).not.toBeInTheDocument();
  });
});

describe("Profile editing and garments", () => {
  test("profile edits start with current values and persist through reload", async () => {
    const view = await start("token:account-a");
    await profile();
    await user.click(
      screen.getByRole("button", { name: "Change profile data" }),
    );
    const name = screen.getByLabelText(/^Name/);
    expect(name).toHaveValue("Account A");
    expect(screen.getByLabelText(/^Avatar/)).toHaveValue(
      "https://example.com/a.jpg",
    );
    await user.clear(name);
    await user.type(name, "Updated Account");
    await user.click(screen.getByRole("button", { name: "Save changes" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(api.db.users[0].name).toBe("Updated Account");
    view.unmount();
    await start();
    expect(
      await screen.findByRole("link", { name: "Go to profile" }),
    ).toHaveTextContent("Updated Account");
  });

  test("URL-only garment creation updates the grid and survives reload", async () => {
    const view = await start("token:account-a");
    await user.click(
      await screen.findByRole("button", { name: /Add Clothes/ }),
    );
    const dialog = await fillGarment("  New sweater  ");
    expect(
      within(dialog).getByLabelText("Image", { exact: true }),
    ).toHaveAttribute("type", "url");
    expect(
      dialog.querySelector('input[type="file"], [name="color"]'),
    ).toBeNull();
    await user.click(
      within(dialog).getByRole("button", { name: "Add garment" }),
    );
    expect(
      await screen.findByRole("button", { name: "View New sweater" }),
    ).toBeVisible();
    expect(api.db.items[0]).toMatchObject({
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
    await user.click(
      await screen.findByRole("button", { name: "Like Sweater" }),
    );
    expect(
      await screen.findByRole("button", { name: "Unlike Sweater" }),
    ).toHaveAttribute("aria-pressed", "true");
    await profile();
    await user.click(screen.getByRole("button", { name: "Unlike Sweater" }));
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
    await user.click(screen.getByRole("button", { name: "View T-Shirt" }));
    expect(
      screen.queryByRole("button", { name: "Delete item" }),
    ).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: "View Sweater" }));
    await user.click(screen.getByRole("button", { name: "Delete item" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(api.db.items.some((item) => item._id === "a-warm")).toBe(true);
    await user.click(screen.getByRole("button", { name: "View Sweater" }));
    await user.click(screen.getByRole("button", { name: "Delete item" }));
    await user.click(screen.getByRole("button", { name: "Yes, delete item" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.queryByRole("button", { name: "View Sweater" }),
    ).not.toBeInTheDocument();
    expect(api.db.items.some((item) => item._id === "a-warm")).toBe(false);
  });
});

describe("Async failures and stale responses", () => {
  test("network failures retain editable input for retry", async () => {
    api.intercept(({ path }) =>
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
    api.intercept(({ path, method }) =>
      path === "/items" && method === "POST"
        ? response({ message: "Unauthorized" }, 401)
        : undefined,
    );
    await start("token:account-a");
    await user.click(
      await screen.findByRole("button", { name: /Add Clothes/ }),
    );
    const dialog = await fillGarment();
    await user.click(
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
    api.intercept(({ path }) =>
      path === "/signin" ? held.promise : undefined,
    );
    await start();
    await logIn();
    await user.keyboard("{Escape}");
    await act(async () => held.resolve(response({ token: "token:account-a" })));
    expect(localStorage.getItem("jwt")).toBeNull();
    expect(
      screen.queryByRole("link", { name: "Go to profile" }),
    ).not.toBeInTheDocument();
  });

  test("a late garment response cannot close a reopened form", async () => {
    const held = deferred();
    api.intercept(({ path, method }) =>
      path === "/items" && method === "POST" ? held.promise : undefined,
    );
    await start("token:account-a");
    await user.click(
      await screen.findByRole("button", { name: /Add Clothes/ }),
    );
    const dialog = await fillGarment();
    await user.click(
      within(dialog).getByRole("button", { name: "Add garment" }),
    );
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /Add Clothes/ }));
    await user.type(
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
    api.intercept(({ path, method }) =>
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
    api.intercept(({ path }) =>
      path.endsWith("/likes")
        ? response({ message: "Please retry the like" }, 500)
        : undefined,
    );
    await start("token:account-a");
    await user.click(
      await screen.findByRole("button", { name: "Like Sweater" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Please retry the like",
    );
    expect(screen.getByRole("button", { name: "Like Sweater" })).toBeEnabled();
    api.intercept(() => undefined);
    await user.click(screen.getByRole("button", { name: "Like Sweater" }));
    expect(
      await screen.findByRole("button", { name: "Unlike Sweater" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("pending deletion locks dismissal and failure unlocks retry", async () => {
    const held = deferred();
    api.intercept(({ method }) =>
      method === "DELETE" ? held.promise : undefined,
    );
    await start("token:account-a");
    await user.click(screen.getByRole("button", { name: "View Sweater" }));
    await user.click(screen.getByRole("button", { name: "Delete item" }));
    await user.dblClick(
      screen.getByRole("button", { name: "Yes, delete item" }),
    );
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Close" })).toBeDisabled();
    await user.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeVisible();
    expect(api.calls.filter((call) => call.method === "DELETE")).toHaveLength(
      1,
    );
    await user.tab();
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
    api.intercept(({ path }) =>
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

describe("Accessibility and weather interactions", () => {
  test("dialogs focus inputs, close with Escape, and return focus", async () => {
    await start();
    const trigger = screen.getByRole("button", { name: "Log In", exact: true });
    await user.click(trigger);
    expect(screen.getByLabelText(/^Email/)).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  test("Tab and Shift+Tab wrap focus inside the dialog", async () => {
    await start();
    await user.click(
      screen.getByRole("button", { name: "Log In", exact: true }),
    );
    const dialog = screen.getByRole("dialog");
    const close = within(dialog).getByRole("button", { name: "Close" });
    close.focus();
    await user.tab({ shift: true });
    expect(
      within(dialog).getByRole("button", { name: "or Sign Up" }),
    ).toHaveFocus();
    await user.tab();
    expect(close).toHaveFocus();
  });

  test("blurred invalid fields expose validation feedback and block submission", async () => {
    await start();
    await user.click(
      screen.getByRole("button", { name: "Sign Up", exact: true }),
    );
    const email = screen.getByLabelText(/^Email/);
    await user.type(email, "invalid-email");
    await user.tab();
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
    await user.click(screen.getByRole("checkbox", { name: "Use Celsius" }));
    expect(
      screen.getByRole("heading", { name: /Today is 21°C/ }),
    ).toBeVisible();
    expect(screen.getByText("21°C", { exact: true })).toBeVisible();
  });

  test("randomization selects only weather-appropriate garments", async () => {
    await start();
    await user.click(screen.getByRole("button", { name: "Randomize" }));
    expect(screen.getAllByRole("button", { name: /^View / })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "View T-Shirt" })).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "View Coat" }),
    ).not.toBeInTheDocument();
  });

  test("randomization still displays an item when no outfit category is selected", async () => {
    api.db.items = api.db.items.filter((item) => item._id === "a-warm");
    await start();
    await user.click(screen.getByRole("button", { name: "Randomize" }));
    expect(screen.getByRole("button", { name: "View Sweater" })).toBeVisible();
  });

  test("an empty profile still allows adding a first garment", async () => {
    api.db.items = [];
    await start("token:account-a");
    await profile();
    expect(
      screen.queryByRole("button", { name: /^View / }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "+ Add New" }));
    expect(screen.getByRole("dialog", { name: "New garment" })).toBeVisible();
  });

  test("authenticated mobile navigation opens profile and the add form", async () => {
    await start("token:account-a");
    await screen.findByRole("link", { name: "Go to profile" });
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(within(screen.getByRole("dialog")).getByRole("link"));
    expect(
      await screen.findByRole("heading", { name: "Your profile" }),
    ).toBeVisible();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: /Add Clothes/,
      }),
    );
    expect(screen.getByRole("dialog", { name: "New garment" })).toBeVisible();
  });

  test("keyboard activation opens a card preview", async () => {
    await start();
    screen.getByRole("button", { name: "View Sweater" }).focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("dialog", { name: "Sweater" })).toBeVisible();
  });

  test("mobile guest actions switch to the correct auth dialog", async () => {
    await start();
    await user.click(screen.getByRole("button", { name: "Open menu" }));
    await user.click(
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
    api.db.items = api.db.items.filter((item) => item.weather === "cold");
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
