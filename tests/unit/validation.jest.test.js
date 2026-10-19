import { describe, expect, test } from "@jest/globals";
import formValidation, {
  normalizeFormValues,
} from "../../src/hooks/formValidation.js";

const valid = {
  name: "Sweater",
  image: "https://example.com/sweater.jpg",
  weather: "warm",
  email: "user@example.com",
  avatar: "https://example.com/avatar.jpg",
  password: "Password1!",
};

describe("formValidation", () => {
  test.each(["clothing", "registration", "login", "profile"])(
    "accepts valid %s data",
    (type) => {
      expect(formValidation(valid, type).isFormValid).toBe(true);
    },
  );
  test.each(["", " ", "a", "a".repeat(31)])(
    "rejects invalid names (%p)",
    (name) => {
      expect(formValidation({ ...valid, name }).nameIsValid).toBe(false);
    },
  );
  test.each(["ab", "a".repeat(30), "  Good name  "])(
    "accepts name boundaries and surrounding spaces (%p)",
    (name) => {
      expect(formValidation({ ...valid, name }).nameIsValid).toBe(true);
    },
  );
  test.each([
    "",
    "not-a-url",
    "https://example/photo.jpg",
    "ftp://example.com/photo.jpg",
    "javascript:alert(1)",
    "//example.com/photo.jpg",
    "https://user:password@example.com/p.jpg",
  ])("rejects unsafe or incomplete image/avatar URLs (%p)", (url) => {
    const result = formValidation({ ...valid, image: url, avatar: url });
    expect(result.imageIsValid).toBe(false);
    expect(result.avatarIsValid).toBe(false);
  });
  test.each(["http://example.com/a.jpg", " https://example.com/a.jpg "])(
    "accepts complete image URLs (%p)",
    (url) => {
      expect(formValidation({ ...valid, image: url }).imageIsValid).toBe(true);
    },
  );
  test.each(["bad-email", "user@", ""])(
    "rejects invalid registration emails (%p)",
    (email) => {
      expect(
        formValidation({ ...valid, email }, "registration").isFormValid,
      ).toBe(false);
    },
  );
  test.each(["short1!", "password1!", "Password!", "Password1", ""])(
    "rejects registration passwords that miss a rule (%p)",
    (password) => {
      expect(
        formValidation({ ...valid, password }, "registration").passwordIsValid,
      ).toBe(false);
    },
  );
  test("login accepts an existing password without applying signup complexity rules", () => {
    expect(
      formValidation({ email: valid.email, password: "old-password" }, "login")
        .isFormValid,
    ).toBe(true);
    expect(
      formValidation({ email: valid.email, password: "" }, "login").isFormValid,
    ).toBe(false);
  });
  test.each(["hot", "warm", "cold"])(
    "accepts the %s weather category",
    (weather) => {
      expect(formValidation({ ...valid, weather }).weatherIsValid).toBe(true);
    },
  );
  test("rejects unknown categories, form types, and missing values", () => {
    expect(formValidation({ ...valid, weather: "snow" }).isFormValid).toBe(
      false,
    );
    expect(formValidation(valid, "unknown").isFormValid).toBe(false);
    expect(formValidation().isFormValid).toBe(false);
  });
});

describe("normalizeFormValues", () => {
  test("trims text but preserves password bytes and non-string values", () => {
    const input = Object.freeze({
      name: "  User  ",
      image: " https://example.com/p.jpg ",
      password: " Password1! ",
      count: 2,
      enabled: false,
      empty: null,
    });
    expect(normalizeFormValues(input)).toEqual({
      name: "User",
      image: "https://example.com/p.jpg",
      password: " Password1! ",
      count: 2,
      enabled: false,
      empty: null,
    });
    expect(input.name).toBe("  User  ");
  });
  test("accepts an empty form", () =>
    expect(normalizeFormValues({})).toEqual({}));
});
