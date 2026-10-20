import { REQUEST_TIMEOUT_MS } from "./constants.js";
import { createAbortError, createUserError } from "./errors.js";

export const BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
).replace(/\/$/, "");
export const UNAUTHORIZED_STATUS = 401;
const NO_CONTENT_STATUS = 204;

function getResponseMessage(body, status) {
  if (
    status === 400 &&
    body?.validation &&
    typeof body.validation === "object" &&
    !Array.isArray(body.validation)
  ) {
    const details = Object.values(body.validation)
      .map((segment) =>
        typeof segment?.message === "string" ? segment.message.trim() : "",
      )
      .filter(Boolean);
    if (details.length > 0) return details.join(" ");
  }
  return typeof body?.message === "string" ? body.message.trim() : "";
}

export const handleResponse = async (request) => {
  const response = await request;
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message = getResponseMessage(body, response.status);
    const error = new Error(
      message || "Something went wrong. Please try again.",
    );
    error.status = response.status;
    throw error;
  }
  return response.status === NO_CONTENT_STATUS ? null : response.json();
};

export function createRequest({ fetcher = (...args) => fetch(...args) } = {}) {
  return async function request(url, { signal, ...options } = {}) {
    if (signal?.aborted) throw signal.reason || createAbortError();

    const controller = new AbortController();
    const cancellation = {};
    const cancelled = new Promise((_, reject) => {
      cancellation.abort = (error) => {
        controller.abort(error);
        reject(error);
      };
    });
    const onAbort = () =>
      cancellation.abort(signal.reason || createAbortError());
    signal?.addEventListener("abort", onAbort, { once: true });
    const timer = setTimeout(() => {
      const error = createUserError(
        "The request took too long. Please try again.",
      );
      error.name = "TimeoutError";
      cancellation.abort(error);
    }, REQUEST_TIMEOUT_MS);

    try {
      return await Promise.race([
        Promise.resolve().then(() => {
          if (controller.signal.aborted) throw controller.signal.reason;
          return handleResponse(
            fetcher(url, { ...options, signal: controller.signal }),
          );
        }),
        cancelled,
      ]);
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
    }
  };
}

export const request = createRequest();
