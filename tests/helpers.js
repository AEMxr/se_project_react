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

let root;
export function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
export function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => structuredClone(body),
  };
}
export function fixture() {
  const db = {
    users: [
      {
        _id: "account-a",
        name: "Account A",
        email: "a@example.com",
        password: "Password1!",
        avatar: "https://example.com/a.jpg",
      },
      {
        _id: "account-b",
        name: "Account B",
        email: "b@example.com",
        password: "Password1!",
        avatar: "https://example.com/b.jpg",
      },
    ],
    items: [
      {
        _id: "a-warm",
        name: "Sweater",
        weather: "warm",
        owner: "account-a",
        likes: [],
        imageUrl: "https://example.com/sweater.jpg",
      },
      {
        _id: "b-warm",
        name: "T-Shirt",
        weather: "warm",
        owner: "account-b",
        likes: [],
        imageUrl: "https://example.com/shirt.jpg",
      },
      {
        _id: "a-cold",
        name: "Coat",
        weather: "cold",
        owner: "account-a",
        likes: [],
        imageUrl: "https://example.com/coat.jpg",
      },
    ],
  };
  const calls = [];
  let intercept = () => undefined;
  const fetch = async (input, options = {}) => {
    const url = new URL(String(input));
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : undefined;
    const call = {
      url,
      path: url.pathname,
      method,
      body,
      headers: options.headers || {},
    };
    calls.push(call);
    const custom = intercept(call);
    if (custom !== undefined) return custom;
    if (url.hostname === "api.openweathermap.org")
      return response({
        name: "Vancouver",
        main: { temp: 70 },
        weather: [{ main: "Clear" }],
        dt: 100,
        sys: { sunrise: 0, sunset: 200 },
      });
    if (call.path === "/signup") {
      if (db.users.some((user) => user.email === body.email))
        return response({ message: "Email is already registered" }, 409);
      const user = { ...body, _id: "account-" + db.users.length };
      db.users.push(user);
      return response(
        {
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          email: user.email,
        },
        201,
      );
    }
    if (call.path === "/signin") {
      const user = db.users.find(
        (entry) =>
          entry.email === body.email && entry.password === body.password,
      );
      return user
        ? response({ token: "token:" + user._id })
        : response({ message: "Incorrect email or password" }, 401);
    }
    if (call.path === "/items" && method === "GET") return response(db.items);
    const token = call.headers.Authorization?.replace("Bearer token:", "");
    const user = db.users.find((entry) => entry._id === token);
    if (!user) return response({ message: "Unauthorized" }, 401);
    const publicUser = () => ({
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      email: user.email,
    });
    if (call.path === "/users/me") {
      if (method === "PATCH") Object.assign(user, body);
      return response(publicUser());
    }
    if (call.path === "/items" && method === "POST") {
      const item = {
        ...body,
        _id: "new-" + db.items.length,
        owner: user._id,
        likes: [],
      };
      db.items.unshift(item);
      return response(item, 201);
    }
    const id = decodeURIComponent(call.path.split("/")[2] || "");
    const item = db.items.find((entry) => entry._id === id);
    if (!item) return response({ message: "Item not found" }, 404);
    if (call.path.endsWith("/likes")) {
      item.likes =
        method === "PUT"
          ? [...new Set([...item.likes, user._id])]
          : item.likes.filter((entry) => entry !== user._id);
      return response(item);
    }
    if (method === "DELETE") {
      if (item.owner !== user._id)
        return response({ message: "Forbidden" }, 403);
      db.items = db.items.filter((entry) => entry._id !== id);
      return response(item);
    }
    throw new Error("Unexpected fixture request");
  };
  return {
    db,
    calls,
    fetch,
    intercept: (handler) => {
      intercept = handler;
    },
  };
}
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
  root = createRoot(document.getElementById("root"));
  await act(async () => {
    root.render(createElement(Component));
  });
}
export async function cleanup() {
  if (root)
    await act(async () => {
      root.unmount();
      root = null;
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
    for (let count = 0; count < 12; count += 1) await Promise.resolve();
  });
}
export async function login(email = "a@example.com") {
  await click(".header__auth-button:last-child");
  await input("email", email);
  await input("password", "Password1!");
  await click(".modal__submit");
}
