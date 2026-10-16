export function createAbortError() {
  return new DOMException("This request is no longer active.", "AbortError");
}

export function createUserError(message) {
  const error = new Error(message);
  error.userMessage = message;
  return error;
}

export function getErrorMessage(
  error,
  fallback = "Something went wrong. Please try again.",
) {
  if (typeof error?.userMessage === "string") return error.userMessage;
  if (typeof error?.status === "number" && typeof error.message === "string")
    return error.message;
  if (error instanceof TypeError)
    return "Unable to reach the server. Check your connection and try again.";
  return fallback;
}

export function rejectRequest(error) {
  throw error;
}
