import assert from "node:assert/strict";
import test from "node:test";
import validate, { normalizeFormValues } from "../src/hooks/formValidation.js";
import { getWeatherType } from "../src/utils/weatherApi.js";
import { mergeInitialItems } from "../src/utils/items.js";

const valid = {
  name: "Sweater",
  image: "https://example.com/sweater.jpg",
  avatar: "https://example.com/avatar.jpg",
  weather: "warm",
  email: "user@example.com",
  password: "ValidPass123!",
};

test("forms reject blank names, invalid hosts and unsupported image protocols", () => {
  assert.equal(validate(valid).isFormValid, true);
  for (const name of ["", " ", " x ", "a".repeat(31)])
    assert.equal(validate({ ...valid, name }).nameIsValid, false);
  for (const image of [
    "https://example/photo.jpg",
    "javascript:alert(1)",
    "//example.com/photo.jpg",
    "https://user:password@example.com/p.jpg",
  ])
    assert.equal(validate({ ...valid, image }).imageIsValid, false);
  assert.equal(
    validate({ ...valid, email: "not an email" }, "registration").isFormValid,
    false,
  );
  assert.equal(validate({ ...valid, weather: "snow" }).isFormValid, false);
});

test("normalization trims text and URLs while preserving password bytes", () => {
  const values = normalizeFormValues({
    name: "  User Name  ",
    email: " user@example.com ",
    password: " ValidPass123! ",
    image: " https://example.com/photo.jpg ",
  });
  assert.deepEqual(values, {
    name: "User Name",
    email: "user@example.com",
    password: " ValidPass123! ",
    image: "https://example.com/photo.jpg",
  });
  assert.equal(
    validate({ ...valid, name: "  Valid name  " }).nameIsValid,
    true,
  );
  assert.equal(
    validate({ email: valid.email, password: "old-password" }, "login")
      .isFormValid,
    true,
  );
});

test("unknown weather never selects a temperature category", () => {
  for (const temperature of [null, undefined, NaN])
    assert.equal(getWeatherType(temperature), null);
  assert.equal(getWeatherType(65), "cold");
  assert.equal(getWeatherType(66), "warm");
  assert.equal(getWeatherType(86), "hot");
});

test("late initial items preserve additions, likes and deletions without duplicates", () => {
  const current = [{ _id: "new" }, { _id: "liked", likes: ["user"] }];
  const stale = [
    { _id: "new" },
    { _id: "liked", likes: [] },
    { _id: "deleted" },
    { _id: "untouched" },
  ];
  const merged = mergeInitialItems(
    current,
    stale,
    new Set(["new", "liked", "deleted"]),
  );
  assert.deepEqual(merged, [...current, { _id: "untouched" }]);
});
