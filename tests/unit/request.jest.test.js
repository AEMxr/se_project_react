import { describe, expect, test } from "@jest/globals";
import { handleResponse } from "../../src/utils/request.js";
import { jsonResponse } from "../fixtures/response.js";

describe("handleResponse", () => {
  test("returns successful JSON", async () => {
    const body = [{ _id: "item" }];
    await expect(
      handleResponse(Promise.resolve(jsonResponse(body))),
    ).resolves.toEqual(body);
  });
  test("does not parse a 204 response", async () => {
    const response = jsonResponse(undefined, 204);
    await expect(handleResponse(Promise.resolve(response))).resolves.toBeNull();
    expect(response.json).not.toHaveBeenCalled();
  });
  test("preserves the HTTP status and trims backend messages", async () => {
    await expect(
      handleResponse(
        Promise.resolve(jsonResponse({ message: "  Duplicate email  " }, 409)),
      ),
    ).rejects.toMatchObject({ status: 409, message: "Duplicate email" });
  });
  test("displays Celebrate's validation details instead of its generic message", async () => {
    await expect(
      handleResponse(
        Promise.resolve(
          jsonResponse(
            {
              message: "Validation failed",
              validation: {
                body: { message: '  "avatar" must be a valid image URL  ' },
                params: {
                  message: '"itemId" must contain 24 hexadecimal characters',
                },
              },
            },
            400,
          ),
        ),
      ),
    ).rejects.toMatchObject({
      status: 400,
      message:
        '"avatar" must be a valid image URL "itemId" must contain 24 hexadecimal characters',
    });
  });
  test.each([
    null,
    [],
    "invalid",
    {},
    { body: null },
    { body: { message: 1 } },
    { body: { message: " " } },
  ])(
    "falls back safely for malformed validation details (%p)",
    async (validation) => {
      await expect(
        handleResponse(
          Promise.resolve(
            jsonResponse({ message: "Invalid data", validation }, 400),
          ),
        ),
      ).rejects.toMatchObject({ status: 400, message: "Invalid data" });
    },
  );
  test("does not replace non-validation server errors with validation metadata", async () => {
    await expect(
      handleResponse(
        Promise.resolve(
          jsonResponse(
            {
              message: "Service unavailable",
              validation: { body: { message: "Ignore this" } },
            },
            503,
          ),
        ),
      ),
    ).rejects.toMatchObject({ status: 503, message: "Service unavailable" });
  });
  test.each([{}, null, { message: "  " }, { message: 123 }])(
    "uses a readable fallback when an error body has no useful message (%p)",
    async (body) => {
      await expect(
        handleResponse(Promise.resolve(jsonResponse(body, 500))),
      ).rejects.toMatchObject({
        status: 500,
        message: "Something went wrong. Please try again.",
      });
    },
  );
  test("handles a non-JSON server error", async () => {
    const response = jsonResponse(undefined, 502);
    response.json.mockRejectedValue(new SyntaxError("Invalid JSON"));
    await expect(
      handleResponse(Promise.resolve(response)),
    ).rejects.toMatchObject({
      status: 502,
      message: "Something went wrong. Please try again.",
    });
  });
  test("propagates a network error unchanged", async () => {
    const error = new TypeError("Failed to fetch");
    await expect(handleResponse(Promise.reject(error))).rejects.toBe(error);
  });
  test("does not silently accept malformed successful JSON", async () => {
    const error = new SyntaxError("Invalid JSON");
    const response = jsonResponse(undefined);
    response.json.mockRejectedValue(error);
    await expect(handleResponse(Promise.resolve(response))).rejects.toBe(error);
  });
});
