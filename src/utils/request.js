export const BASE = "http://localhost:3001";

export const UNAUTHORIZED_STATUS = 401;

export const handleResponse = async (p) => {
  const res = await p;

  if (!res.ok) {
    const error = new Error(`API ${res.status}`);
    error.status = res.status;
    throw error;
  }

  return res.json();
};