import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { buildOutfit } from "../../src/utils/outfitBuilder.js";

const wardrobe = [
  "Beanie",
  "Scarf",
  "T-Shirt",
  "Jacket",
  "Thermal leggings",
  "Jeans",
  "Boots",
  "Socks",
  "Gloves",
  "Umbrella",
  "Sunglasses",
].map((name, index) => ({ _id: String(index), name }));
const names = (result) => result.selectedItems.map((item) => item.name);
beforeEach(() => jest.spyOn(Math, "random").mockReturnValue(0));

describe("buildOutfit", () => {
  test("selects protective layers, footwear, and an umbrella for cold rain", () => {
    const result = buildOutfit({
      items: wardrobe,
      weatherType: "cold",
      tempF: 25,
      weatherCondition: "Rain",
    });
    expect(names(result)).toEqual([
      "Beanie",
      "Scarf",
      "T-Shirt",
      "Jacket",
      "Thermal leggings",
      "Jeans",
      "Boots",
      "Socks",
      "Gloves",
      "Umbrella",
    ]);
    expect(new Set(result.selectedItems.map((item) => item._id)).size).toBe(
      result.selectedItems.length,
    );
  });
  test("avoids cold layers in warm sunshine and selects sunglasses", () => {
    const items = [
      ...wardrobe.filter((item) => item.name !== "Boots"),
      { _id: "sandals", name: "Sandals" },
    ];
    const result = buildOutfit({
      items,
      weatherType: "warm",
      tempF: 75,
      weatherCondition: "Sunny",
    });
    expect(names(result)).toEqual([
      "T-Shirt",
      "Jeans",
      "Sandals",
      "Sunglasses",
    ]);
  });
  test("can select a different item when randomness changes", () => {
    Math.random.mockReturnValue(0.99);
    const items = [
      { _id: "a", name: "Blue T-Shirt" },
      { _id: "b", name: "Red T-Shirt" },
    ];
    expect(
      names(
        buildOutfit({
          items,
          weatherType: "warm",
          tempF: 75,
          weatherCondition: "Cloudy",
        }),
      ),
    ).toEqual(["Red T-Shirt"]);
  });
  test("does not mistake Capri pants for a cap", () => {
    const result = buildOutfit({
      items: [{ _id: "pants", name: "Capri pants" }],
      weatherType: "cold",
      tempF: 30,
      weatherCondition: "Cloudy",
    });
    expect(result.outfit.head).toBeUndefined();
    expect(names(result)).toEqual(["Capri pants"]);
  });
  test("handles an empty wardrobe without throwing", () => {
    const result = buildOutfit({
      items: [],
      weatherType: "cold",
      weatherCondition: "Cloudy",
    });
    expect(result.selectedItems).toEqual([]);
    expect(result.reasons.topBase).toContain("No base tops");
  });
  test("does not mutate wardrobe records", () => {
    const items = Object.freeze(
      wardrobe.map((item) => Object.freeze({ ...item })),
    );
    const before = structuredClone(items);
    buildOutfit({
      items,
      weatherType: "cold",
      tempF: 25,
      weatherCondition: "Snow",
    });
    expect(items).toEqual(before);
  });
});
