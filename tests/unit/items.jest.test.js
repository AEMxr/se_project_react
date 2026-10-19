import { describe, expect, test } from "@jest/globals";
import { normalizeItem, mergeInitialItems } from "../../src/utils/items.js";

describe("normalizeItem", () => {
  test("normalizes API items without changing the input", () => {
    const item = Object.freeze({
      _id: "1",
      name: "Coat",
      weather: "COLD",
      imageUrl: "https://example.com/coat.jpg",
      owner: "user",
      likes: [],
    });
    const normalized = normalizeItem(item);
    expect(normalized).toEqual({
      ...item,
      weather: "cold",
      link: item.imageUrl,
    });
    expect(normalized).not.toBe(item);
    expect(item.weather).toBe("COLD");
  });
  test("preserves a legacy link and defaults missing weather", () => {
    expect(normalizeItem({ link: "https://example.com/item.jpg" })).toEqual({
      link: "https://example.com/item.jpg",
      weather: "any",
    });
  });
  test("prefers the backend image URL over an older link", () => {
    expect(
      normalizeItem({ imageUrl: "new", link: "old", weather: "warm" }).link,
    ).toBe("new");
  });
});

describe("mergeInitialItems", () => {
  test("preserves additions and newer likes while excluding deleted items", () => {
    const current = [
      { _id: "new", likes: [] },
      { _id: "liked", likes: ["user"] },
    ];
    const loaded = [
      { _id: "liked", likes: [] },
      { _id: "deleted" },
      { _id: "other" },
      { _id: "new" },
    ];
    const before = structuredClone({ current, loaded });
    const result = mergeInitialItems(
      current,
      loaded,
      new Set(["new", "liked", "deleted"]),
    );
    expect(result).toEqual([...current, { _id: "other" }]);
    expect({ current, loaded }).toEqual(before);
  });
  test("deduplicates repeated IDs from loading", () => {
    expect(
      mergeInitialItems(
        [],
        [
          { _id: "a", name: "old" },
          { _id: "a", name: "latest" },
        ],
        new Set(),
      ),
    ).toEqual([{ _id: "a", name: "latest" }]);
  });
  test("accepts empty lists", () => {
    expect(mergeInitialItems([], [], new Set())).toEqual([]);
  });
});
