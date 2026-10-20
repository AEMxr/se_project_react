import {
  afterEach,
  beforeEach,
  describe,
  expect,
  jest,
  test,
} from "@jest/globals";
import { request } from "../../src/utils/request.js";
import { REQUEST_TIMEOUT_MS } from "../../src/utils/constants.js";
import { deferred } from "../fixtures/api.js";
import { jsonResponse } from "../fixtures/response.js";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("Bounded API requests", () => {
  test("times out a stalled connection, aborts it, and does not resend a mutation", async () => {
    fetch.mockReturnValue(deferred().promise);
    const pending = request("/items", { method: "POST", body: "{}" });
    const rejected = expect(pending).rejects.toMatchObject({
      name: "TimeoutError",
      userMessage: "The request took too long. Please try again.",
    });
    await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS - 1);
    const signal = fetch.mock.calls[0][1].signal;
    expect(signal.aborted).toBe(false);
    await jest.advanceTimersByTimeAsync(1);
    await rejected;
    expect(signal.aborted).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each([200, 400])(
    "also bounds reading a stalled %i response body",
    async (status) => {
      const response = jsonResponse({}, status);
      response.json.mockReturnValue(deferred().promise);
      fetch.mockResolvedValue(response);
      const rejected = expect(request("/items")).rejects.toMatchObject({
        name: "TimeoutError",
      });
      await jest.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);
      await rejected;
      expect(response.json).toHaveBeenCalledTimes(1);
      expect(fetch.mock.calls[0][1].signal.aborted).toBe(true);
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  test("forwards cancellation, preserves its reason and releases its listener and timer", async () => {
    const controller = new AbortController();
    const remove = jest.spyOn(controller.signal, "removeEventListener");
    const held = deferred();
    fetch.mockReturnValue(held.promise);
    const reason = new DOMException("View closed", "AbortError");
    const rejected = expect(
      request("/items", { signal: controller.signal }),
    ).rejects.toBe(reason);
    await Promise.resolve();
    const signal = fetch.mock.calls[0][1].signal;
    controller.abort(reason);
    await rejected;
    expect(signal.aborted).toBe(true);
    expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
    expect(jest.getTimerCount()).toBe(0);
    held.resolve(jsonResponse([{ _id: "late" }]));
    await Promise.resolve();
  });

  test("an already cancelled request never starts a fetch or a timer", async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      request("/items", { signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(fetch).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  test("cancellation before the fetch microtask prevents network activity", async () => {
    const controller = new AbortController();
    const rejected = expect(
      request("/items", { signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await rejected;
    expect(fetch).not.toHaveBeenCalled();
    expect(jest.getTimerCount()).toBe(0);
  });

  test.each([200, 503])(
    "cleans up after a completed %i response",
    async (status) => {
      const controller = new AbortController();
      const remove = jest.spyOn(controller.signal, "removeEventListener");
      fetch.mockResolvedValue(
        jsonResponse({ message: "Service unavailable" }, status),
      );
      const result = request("/items", { signal: controller.signal });
      if (status === 200)
        await expect(result).resolves.toEqual({
          message: "Service unavailable",
        });
      else await expect(result).rejects.toMatchObject({ status: 503 });
      expect(remove).toHaveBeenCalledWith("abort", expect.any(Function));
      expect(jest.getTimerCount()).toBe(0);
    },
  );

  test("cleans up after a synchronous network failure", async () => {
    const error = new TypeError("Offline");
    fetch.mockImplementation(() => {
      throw error;
    });
    await expect(request("/items")).rejects.toBe(error);
    expect(jest.getTimerCount()).toBe(0);
  });
});
