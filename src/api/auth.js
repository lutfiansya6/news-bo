const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, options);

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error || `Gagal memuat data (${response.status})`;
    throw new Error(message);
  }

  const payload = await response.json();
  return payload.data;
}

export function login(credentials) {
  return request("/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
}

export function verifyToken(token) {
  return request("/api/admin/verify", {
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
}