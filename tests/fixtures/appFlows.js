/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { beforeEach, expect } from "@jest/globals";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../src/components/App.jsx";
import { fixture } from "../fixtures/api.js";
export const testState = {};
beforeEach(() => {
  testState.api = fixture();
  fetch.mockImplementation(testState.api.fetch);
  testState.user = userEvent.setup();
});
export async function start(token) {
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
export async function logIn(email = "a@example.com", password = "Password1!") {
  await testState.user.click(
    screen.getByRole("button", {
      name: "Log In",
      exact: true,
    }),
  );
  const dialog = screen.getByRole("dialog", {
    name: "Log In",
  });
  await testState.user.type(within(dialog).getByLabelText(/^Email/), email);
  await testState.user.type(
    within(dialog).getByLabelText(/^Password/),
    password,
  );
  await testState.user.click(
    within(dialog).getByRole("button", {
      name: "Log In",
      exact: true,
    }),
  );
}
export async function profile() {
  await testState.user.click(
    await screen.findByRole("link", {
      name: "Go to profile",
    }),
  );
  await screen.findByRole("heading", {
    name: "Your profile",
  });
}
export async function fillGarment(name = "New sweater") {
  const dialog = screen.getByRole("dialog", {
    name: "New garment",
  });
  await testState.user.type(
    within(dialog).getByLabelText("Name", {
      exact: true,
    }),
    name,
  );
  await testState.user.type(
    within(dialog).getByLabelText("Image", {
      exact: true,
    }),
    "https://example.com/new.jpg",
  );
  return dialog;
}
