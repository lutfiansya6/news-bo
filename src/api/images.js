const IMGBB_API_URL = "https://api.imgbb.com/1/upload";

/**
 * Upload file gambar ke ImgBB.
 * @param {File} file - File gambar dari input
 * @param {string} apiKey - ImgBB API key dari https://api.imgbb.com/
 * @returns {Promise<{url: string, thumb: string, deleteUrl: string, name: string, size: number}>}
 */
export async function uploadImage(file, apiKey) {
  if (!apiKey) throw new Error("API Key ImgBB belum dikonfigurasi.");

  const formData = new FormData();
  formData.append("image", file);
  formData.append("name", file.name.replace(/\.[^.]+$/, ""));

  const response = await fetch(`${IMGBB_API_URL}?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });

  const json = await response.json();

  if (!response.ok || !json.success) {
    throw new Error(json?.error?.message || "Gagal mengupload gambar ke ImgBB.");
  }

  return {
    id: json.data.id,
    name: json.data.title || file.name,
    url: json.data.url,
    displayUrl: json.data.display_url,
    thumb: json.data.thumb?.url || json.data.url,
    deleteUrl: json.data.delete_url,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}
