/** @jest-environment jsdom */
import "@testing-library/jest-dom";
import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/react";
import useForm from "../../src/hooks/useForm.js";
import useTouch from "../../src/hooks/useTouch.js";
import useFormSubmit from "../../src/hooks/useFormSubmit.js";
import useCurrentDate from "../../src/hooks/useCurrentDate.js";
import useWeather from "../../src/hooks/useWeather.js";
import { deferred, fixture, response } from "../fixtures/api.js";

afterEach(() => jest.useRealTimers());

describe("Form state and touched fields", () => {
  test("useForm updates one field without losing others and permits reset", () => {
    const initial = { name: "User", email: "user@example.com" };
    const { result } = renderHook(() => useForm(initial));
    act(() =>
      result.current.handleChange({
        target: { name: "name", value: "New Name" },
      }),
    );
    expect(result.current.values).toEqual({ ...initial, name: "New Name" });
    act(() => result.current.setValues(initial));
    expect(result.current.values).toEqual(initial);
  });
  test("useTouch marks only the blurred field and resets touched state", () => {
    const initial = { name: false, avatar: false };
    const { result } = renderHook(() => useTouch(initial));
    act(() => result.current.handleBlur({ target: { name: "avatar" } }));
    expect(result.current.touched).toEqual({ name: false, avatar: true });
    act(() => result.current.resetTouched());
    expect(result.current.touched).toEqual(initial);
  });
});

describe("useFormSubmit request lifecycle", () => {
  test("blocks simultaneous submits and clears pending state on completion", async () => {
    const held = deferred();
    const request = jest.fn(() => held.promise);
    const success = jest.fn();
    const { result } = renderHook(() => useFormSubmit(true));
    const testState = {};

    act(() => {
      testState.pending = result.current.submitForm(request, success);
      result.current.submitForm(request, success);
    });
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(result.current.isSubmitting).toBe(true);
    await act(async () => {
      held.resolve("saved");
      await testState.pending;
    });
    expect(success).toHaveBeenCalledWith("saved");
    expect(result.current.isSubmitting).toBe(false);
  });
  test("keeps readable errors and allows a later successful retry", async () => {
    const { result } = renderHook(() => useFormSubmit(true));
    await act(async () => {
      await result.current.submitForm(() =>
        Promise.reject(new TypeError("Offline")),
      );
    });
    expect(result.current.errorMessage).toContain("Unable to reach the server");
    expect(result.current.isSubmitting).toBe(false);
    const success = jest.fn();
    await act(async () => {
      await result.current.submitForm(() => Promise.resolve("saved"), success);
    });
    expect(result.current.errorMessage).toBe("");
    expect(success).toHaveBeenCalledWith("saved");
  });
  test("old responses cannot invoke success for a reopened form", async () => {
    const held = deferred();
    const success = jest.fn();
    const { result, rerender } = renderHook(({ open }) => useFormSubmit(open), {
      initialProps: { open: true },
    });
    const testState = {};

    act(() => {
      testState.pending = result.current.submitForm(
        () => held.promise,
        success,
      );
    });
    rerender({ open: false });
    rerender({ open: true });
    await act(async () => {
      held.resolve("old result");
      await testState.pending;
    });
    expect(success).not.toHaveBeenCalled();
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errorMessage).toBe("");
  });
  test("ignores intentional cancellation and refuses submissions while closed", async () => {
    const { result, rerender } = renderHook(({ open }) => useFormSubmit(open), {
      initialProps: { open: false },
    });
    const request = jest.fn();
    act(() => result.current.submitForm(request));
    expect(request).not.toHaveBeenCalled();
    rerender({ open: true });
    await act(async () => {
      await result.current.submitForm(() =>
        Promise.reject(new DOMException("Cancelled", "AbortError")),
      );
    });
    expect(result.current.errorMessage).toBe("");
  });
});

describe("useCurrentDate timers", () => {
  test("updates at midnight and removes its timer when unmounted", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 18, 23, 59, 59));
    const { result, unmount } = renderHook(() => useCurrentDate());
    expect(result.current.getDate()).toBe(18);
    act(() => jest.advanceTimersByTime(1000));
    expect(result.current.getDate()).toBe(19);
    unmount();
    expect(jest.getTimerCount()).toBe(0);
  });
  test("refreshes after a tab becomes visible", () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 9, 18, 12));
    const { result } = renderHook(() => useCurrentDate());
    jest.setSystemTime(new Date(2026, 9, 19, 12));
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(result.current.getDate()).toBe(19);
  });
});

describe("useWeather lifecycle", () => {
  test("loads the location's weather and aborts on cleanup", async () => {
    fetch.mockImplementation(fixture().fetch);
    const { result, unmount } = renderHook(() => useWeather());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.weather.city).toBe("Vancouver");
    const signal = fetch.mock.calls[0][1].signal;
    unmount();
    expect(signal.aborted).toBe(true);
  });
  test("falls back when permission is denied", async () => {
    navigator.geolocation.getCurrentPosition = (_success, failure) => failure();
    fetch.mockImplementation(fixture().fetch);
    const { result } = renderHook(() => useWeather());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(new URL(fetch.mock.calls[0][0]).searchParams.get("lat")).toBe(
      "40.7128",
    );
  });
  test("falls back on deadline and ignores a location callback that arrives later", async () => {
    jest.useFakeTimers();
    const testState = {};

    navigator.geolocation.getCurrentPosition = (success) => {
      testState.locationCallback = success;
    };
    fetch.mockImplementation(fixture().fetch);
    const { result } = renderHook(() => useWeather());
    expect(result.current.isLoading).toBe(true);
    await act(async () => jest.advanceTimersByTimeAsync(5000));
    expect(result.current.isLoading).toBe(false);
    await act(async () =>
      testState.locationCallback({ coords: { latitude: 1, longitude: 2 } }),
    );
    expect(fetch).toHaveBeenCalledTimes(1);
  });
  test("shows weather failure feedback without inventing a temperature", async () => {
    fetch.mockResolvedValue(response({ message: "Unavailable" }, 503));
    const { result } = renderHook(() => useWeather());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.errorMessage).toContain("Weather is unavailable");
    expect(result.current.weather.temperature.F).toBeNull();
  });
});
