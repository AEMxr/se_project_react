import { BASE, request } from "./request.js";

export const getItems = ({ signal } = {}) =>
  request(`${BASE}/items`, { signal });

export const createItem = ({ name, image, weather }, token) =>
  request(`${BASE}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, imageUrl: image, weather }),
  });

export const removeItem = (id, token) =>
  request(`${BASE}/items/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

export function updateCurrentUser({ name, avatar }, token) {
  return request(`${BASE}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, avatar }),
  });
}

export function toggleItemLike(id, isLiked, token) {
  return request(`${BASE}/items/${encodeURIComponent(id)}/likes`, {
    method: isLiked ? "DELETE" : "PUT",
    headers: { Authorization: `Bearer ${token}` },
  });
}
