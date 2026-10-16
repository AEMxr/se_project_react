import { BASE, handleResponse } from "./request.js";

export function signIn({ email, password }) {
  return handleResponse(
    fetch(`${BASE}/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }),
  );
}

export function signUp({ email, password, name, avatar }) {
  return handleResponse(
    fetch(`${BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, avatar }),
    }),
  );
}

export function getCurrentUser(token, { signal } = {}) {
  return handleResponse(
    fetch(`${BASE}/users/me`, {
      signal,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }),
  );
}
