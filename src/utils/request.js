export const BASE = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001"
).replace(/\/$/, "");
export const UNAUTHORIZED_STATUS = 401;
const NO_CONTENT_STATUS = 204;

export const handleResponse = async (request) => {
  const response = await request;
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const message =
      typeof body?.message === "string" ? body.message.trim() : "";
    const error = new Error(
      message || "Something went wrong. Please try again.",
    );
    error.status = response.status;
    throw error;
  }
  return response.status === NO_CONTENT_STATUS ? null : response.json();
};
