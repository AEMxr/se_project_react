const BASE = "http://localhost:3001";

const handle = async (p) => {
  const res = await p;
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
};

export const getItems = () => handle(fetch(`${BASE}/items`));

// form uses "image", server expects "imageUrl"
export const createItem = ({ name, image, weather }) =>
  handle(
    fetch(`${BASE}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        imageUrl: image,
        weather: (weather || "any").toLowerCase(),
      }),
    })
  );

export const removeItem = (id) =>
  handle(
    fetch(`${BASE}/items/${encodeURIComponent(id)}`, { method: "DELETE" })
  );
