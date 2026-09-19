const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function requestRaw(path, options = {}) {
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

  return response.json();
}

// Returns only the `data` field — for single-item and mutation endpoints
function request(path, options = {}) {
  return requestRaw(path, options).then((payload) => payload.data);
}

/**
 * Fetch paginated news list.
 * @returns {Promise<{ data: News[], pagination: { page, limit, total, totalPages } }>}
 */
export function getNewsList(categoryId, page = 1, limit = 10) {
  const params = new URLSearchParams({ page, limit });
  if (categoryId) params.set("category", categoryId);
  return requestRaw(`/api/admin/news?${params}`);
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