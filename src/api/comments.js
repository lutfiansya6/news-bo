const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request(path, options = {}) {
  const token = localStorage.getItem("admin_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    const message = payload?.error || `Gagal memuat data (${response.status})`;
    throw new Error(message);
  }

  const payload = await response.json();
  return payload.data;
}

export function getComments() {
  return request("/api/admin/comments");
}

export function deleteComment(id) {
  const commentId = id != null ? String(id) : "";
  if (!commentId || commentId === "undefined") {
    return Promise.reject(new Error("ID komentar tidak valid"));
  }

  return request(`/api/admin/comments/${commentId}`, {
    method: "DELETE",
  });
}