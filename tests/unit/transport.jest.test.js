import { describe, expect, jest, test } from "@jest/globals";
import * as http from "../../src/utils/request.js";
import { jsonResponse } from "../fixtures/response.js";

describe("Injectable HTTP transport contract", () => {
  test.each(["direct", "asynchronous"])(
    "a %s transport preserves request options and parsed data",
    async (mode) => {
      // Arrange: the same fetch-compatible contract can have different implementations.
      const transport = jest.fn((url, options) => {
        expect(url).toBe("/fixture");
        expect(options.headers).toEqual({ Authorization: "Bearer fixture" });
        const response = jsonResponse({ _id: "fixture" });
        return mode === "direct" ? response : Promise.resolve(response);
      });
      const client = http.createRequest({ fetcher: transport });

      // Act.
      const result = await client("/fixture", {
        headers: { Authorization: "Bearer fixture" },
      });

      // Assert.
      expect(result).toEqual({ _id: "fixture" });
      expect(transport).toHaveBeenCalledTimes(1);
      expect(fetch).not.toHaveBeenCalled();
    },
  );

  test("an injected transport preserves the HTTP error contract", async () => {
    const transport = jest
      .fn()
      .mockResolvedValue(jsonResponse({ message: "Not found" }, 404));
    const client = http.createRequest({ fetcher: transport });
    await expect(client("/fixture")).rejects.toMatchObject({
      status: 404,
      message: "Not found",
    });
    expect(fetch).not.toHaveBeenCalled();
  });
});
