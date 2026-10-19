import { describe, expect, test } from "@jest/globals";
import {
  createAbortError,
  createUserError,
  getErrorMessage,
  rejectRequest,
} from "../../src/utils/errors.js";

describe("createAbortError", () => {
  test("creates an AbortError that request handlers can recognize", () => {
    const error = createAbortError();
    expect(error).toBeInstanceOf(DOMException);
    expect(error.name).toBe("AbortError");
    expect(error.message).toContain("no longer active");
  });
});

describe("createUserError", () => {
  test("retains a safe message for display", () => {
    const error = createUserError("Please log in again.");
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe("Please log in again.");
    expect(error.userMessage).toBe(error.message);
  });
});

describe("getErrorMessage", () => {
  test("prioritizes a deliberate user message", () => {
    expect(
      getErrorMessage({
        userMessage: "Try again",
        status: 500,
        message: "Internal details",
      }),
    ).toBe("Try again");
  });
  test("retains a backend response message", () => {
    expect(
      getErrorMessage({ status: 409, message: "Email already registered" }),
    ).toBe("Email already registered");
  });
  test("explains a network failure", () => {
    expect(getErrorMessage(new TypeError("Failed to fetch"))).toContain(
      "Unable to reach the server",
    );
  });
  test.each([undefined, null, new Error("Private details"), {}])(
    "uses safe fallback text for unknown errors (%p)",
    (error) => {
      expect(getErrorMessage(error, "Please retry")).toBe("Please retry");
    },
  );
  test("provides a default fallback", () => {
    expect(getErrorMessage(undefined)).toBe(
      "Something went wrong. Please try again.",
    );
  });
});

describe("rejectRequest", () => {
  test("rethrows the original error instead of swallowing it", () => {
    const error = new Error("Request failed");
    expect(() => rejectRequest(error)).toThrow(error);
  });
});
