import { beforeEach, describe, expect, test } from "@jest/globals";
import {
  getItems,
  createItem,
  removeItem,
  updateCurrentUser,
  toggleItemLike,
} from "../../src/utils/api.js";
import { jsonResponse } from "../fixtures/response.js";

const base = "http://localhost:3001";
const token = "fixture-token";
const item = {
  _id: "item",
  name: "Sweater",
  imageUrl: "https://example.com/s.jpg",
  weather: "warm",
  likes: [],
};
beforeEach(() => fetch.mockResolvedValue(jsonResponse(item)));

describe("getItems", () => {
  test("lists items publicly and forwards cancellation", async () => {
    const controller = new AbortController();
    fetch.mockResolvedValue(jsonResponse([item]));
    await expect(getItems({ signal: controller.signal })).resolves.toEqual([
      item,
    ]);
    expect(fetch).toHaveBeenCalledWith(`${base}/items`, {
      signal: controller.signal,
    });
  });
  test("supports calls without options", async () => {
    await getItems();
    expect(fetch).toHaveBeenCalledWith(`${base}/items`, { signal: undefined });
  });
});

describe("createItem", () => {
  test("sends only the course garment fields with Bearer authorization", async () => {
    await expect(
      createItem(
        {
          name: item.name,
          image: item.imageUrl,
          weather: item.weather,
          owner: "spoofed",
          color: "red",
        },
        token,
      ),
    ).resolves.toEqual(item);
    expect(fetch).toHaveBeenCalledWith(`${base}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: item.name,
        imageUrl: item.imageUrl,
        weather: item.weather,
      }),
    });
  });
});

describe("removeItem", () => {
  test("encodes the item ID and returns the deleted record", async () => {
    await expect(removeItem("item/id ?", token)).resolves.toEqual(item);
    expect(fetch).toHaveBeenCalledWith(`${base}/items/item%2Fid%20%3F`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});

describe("updateCurrentUser", () => {
  test("updates name/avatar without forwarding other account fields", async () => {
    const user = { name: "New Name", avatar: "https://example.com/a.jpg" };
    fetch.mockResolvedValue(jsonResponse(user));
    await expect(
      updateCurrentUser(
        { ...user, email: "other@example.com", _id: "spoofed" },
        token,
      ),
    ).resolves.toEqual(user);
    expect(fetch).toHaveBeenCalledWith(`${base}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(user),
    });
  });
});

describe("toggleItemLike", () => {
  test.each([
    [false, "PUT"],
    [true, "DELETE"],
  ])("uses %s liked state to select %s", async (liked, method) => {
    await expect(toggleItemLike("item/id", liked, token)).resolves.toEqual(
      item,
    );
    expect(fetch).toHaveBeenCalledWith(`${base}/items/item%2Fid/likes`, {
      method,
      headers: { Authorization: `Bearer ${token}` },
    });
  });
});

describe("garment request failures", () => {
  test.each([
    ["getItems", () => getItems()],
    ["createItem", () => createItem(item, token)],
    ["removeItem", () => removeItem("item", token)],
    ["updateCurrentUser", () => updateCurrentUser({}, token)],
    ["toggleItemLike", () => toggleItemLike("item", false, token)],
  ])(
    "%s rejects rather than treating a server error as success",
    async (_name, request) => {
      fetch.mockResolvedValue(jsonResponse({ message: "Request failed" }, 500));
      await expect(request()).rejects.toMatchObject({
        status: 500,
        message: "Request failed",
      });
    },
  );
});
