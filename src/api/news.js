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

export function getNewsList() {
  return request("/api/admin/news");
}

export function getNewsById(id) {
  return request(`/api/admin/news/${id}`);
}

export function createNews(newsData) {
  return request("/api/admin/news", {
    method: "POST",
    body: JSON.stringify(newsData),
  });
}

export function updateNews(id, newsData) {
  return request(`/api/admin/news/${id}`, {
    method: "PUT",
    body: JSON.stringify(newsData),
  });
}

export function deleteNews(id) {
  return request(`/api/admin/news/${id}`, {
    method: "DELETE",
  });
}