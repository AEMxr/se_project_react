import { JSDOM } from "jsdom";
import { act } from "react";

export const dom = new JSDOM(
  '<!doctype html><html><body class="page"><div id="root" class="page__root"></div></body></html>',
  { url: "http://localhost:3000/", pretendToBeVisual: true },
);
for (const name of [
  "window",
  "document",
  "HTMLElement",
  "HTMLInputElement",
  "Event",
  "MouseEvent",
  "KeyboardEvent",
  "Node",
])
  globalThis[name] = name === "window" ? dom.window : dom.window[name];
Object.defineProperty(globalThis, "navigator", {
  configurable: true,
  value: dom.window.navigator,
});
globalThis.localStorage = dom.window.localStorage;
globalThis.getComputedStyle = dom.window.getComputedStyle.bind(dom.window);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { createRoot } = await import("react-dom/client");
const { createElement } = await import("react");

const testState = {};

export { deferred, response, fixture } from "./fixtures/api.js";
export function setGeolocation(
  handler = (callback) =>
    callback({ coords: { latitude: 49.28, longitude: -123.12 } }),
) {
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    value: { getCurrentPosition: handler },
  });
}
export async function mount(Component) {
  testState.root = createRoot(document.getElementById("root"));
  await act(async () => {
    testState.root.render(createElement(Component));
  });
}
export async function cleanup() {
  if (testState.root)
    await act(async () => {
      testState.root.unmount();
      testState.root = null;
    });
  for (const child of [...document.body.children])
    if (child.id !== "root") child.remove();
  window.history.replaceState({}, "", "/");
  localStorage.clear();
}
export const query = (selector) => document.querySelector(selector);
export const all = (selector) => [...document.querySelectorAll(selector)];
export async function click(selector) {
  const element = typeof selector === "string" ? query(selector) : selector;
  if (!element) throw new Error("Missing click target: " + selector);
  await act(async () => {
    element.click();
  });
}
export async function input(name, value) {
  const element = query('input[name="' + name + '"]');
  if (!element) throw new Error("Missing input: " + name);
  await act(async () => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    ).set.call(element, value);
    element.dispatchEvent(new Event("input", { bubbles: true }));
  });
}
export async function settle(callback = () => {}) {
  await act(async () => {
    callback();
    for (const _ of Array(12)) await Promise.resolve();
  });
}
export async function login(email = "a@example.com") {
  await click(".header__auth-button:last-child");
  await input("email", email);
  await input("password", "Password1!");
  await click(".modal__submit");
}
