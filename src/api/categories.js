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

export function getCategories() {
  return request("/api/admin/categories");
}

export function getCategoryById(id) {
  return request(`/api/admin/categories/${id}`);
}

export function createCategory(categoryData) {
  return request("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  });
}

export function updateCategory(id, categoryData) {
  return request(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  });
}

export function deleteCategory(id) {
  return request(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });
}