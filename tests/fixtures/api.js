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
    if (call.path === "/weather" && method === "GET")
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
