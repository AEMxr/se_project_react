import { BASE, handleResponse } from "./request.js";

export const getItems = () => handleResponse(fetch(`${BASE}/items`));

// form uses "image", server expects "imageUrl"
export const createItem = ({ name, image, weather }, token) =>
  handleResponse(
    fetch(`${BASE}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name,
        imageUrl: image,
        weather,
      }),
    })
  );

export const removeItem = (id, token) =>
  handleResponse(
    fetch(`${BASE}/items/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  );

export function updateCurrentUser({ name, avatar }, token) {
  return handleResponse(
    fetch(`${BASE}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name, avatar }),
    })
  );
}

export function toggleItemLike(id, isLiked, token) {
  let method;

  if (isLiked) {
    method = "DELETE";
  } else {
    method = "PUT";
  }

  return handleResponse(
    fetch(`${BASE}/items/${encodeURIComponent(id)}/likes`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  );
}