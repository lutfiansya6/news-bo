import { useState, useRef, useCallback } from "react";
import { uploadImage } from "../api/images";
import toast from "react-hot-toast";

const STORAGE_KEY = "imgbb_gallery";
const API_KEY_STORAGE = "imgbb_api_key";

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ImageManager() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || "");
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [images, setImages] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showApiSetup, setShowApiSetup] = useState(false);
  const fileInputRef = useRef(null);

  const saveImages = (newImages) => {
    setImages(newImages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      toast.error("API Key tidak boleh kosong.");
      return;
    }
    localStorage.setItem(API_KEY_STORAGE, apiKeyInput.trim());
    setApiKey(apiKeyInput.trim());
    setShowApiSetup(false);
    toast.success("API Key tersimpan!");
  };

  const handleFiles = useCallback(
    async (files) => {
      const validFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (validFiles.length === 0) {
        toast.error("Hanya file gambar yang diperbolehkan.");
        return;
      }

      setUploading(true);
      const results = [];

      for (const file of validFiles) {
        try {
          const result = await uploadImage(file, apiKey);
          results.push(result);
          toast.success(`"${file.name}" berhasil diupload!`);
        } catch (err) {
          toast.error(`Gagal upload "${file.name}": ${err.message}`);
        }
      }

      if (results.length > 0) {
        saveImages([...results, ...images]);
      }
      setUploading(false);
    },
    [apiKey, images]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleCopyUrl = (image) => {
    navigator.clipboard.writeText(image.url).then(() => {
      setCopiedId(image.id);
      toast.success("URL disalin!");
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const handleDelete = (id) => {
    if (!window.confirm("Hapus gambar dari daftar? (Gambar di ImgBB tidak ikut terhapus)")) return;
    saveImages(images.filter((img) => img.id !== id));
    toast.success("Gambar dihapus dari daftar.");
  };

  // API Key setup screen
  if (!apiKey && !showApiSetup) {
    return (
      <div className="image-manager">
        <div className="image-manager-header">
          <h1>📸 Manajemen Gambar</h1>
        </div>
        <div className="imgbb-setup-card">
          <div className="imgbb-setup-icon">🔑</div>
          <h2>Konfigurasi API Key ImgBB</h2>
          <p>
            Gambar diupload ke <strong>ImgBB</strong> — layanan hosting gambar gratis.
            Daftarkan akun gratis di{" "}
            <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer">
              api.imgbb.com
            </a>{" "}
            untuk mendapatkan API Key.
          </p>
          <ol className="imgbb-steps">
            <li>Buka <a href="https://imgbb.com/login" target="_blank" rel="noreferrer">imgbb.com</a> dan daftar akun gratis</li>
            <li>Buka <a href="https://api.imgbb.com/" target="_blank" rel="noreferrer">api.imgbb.com</a> dan klik <strong>Get API key</strong></li>
            <li>Salin API Key dan tempel di bawah ini</li>
          </ol>
          <div className="imgbb-key-input-row">
            <input
              type="text"
              placeholder="Tempel API Key ImgBB di sini..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveApiKey()}
              className="imgbb-key-input"
            />
            <button onClick={handleSaveApiKey} className="imgbb-save-btn">
              Simpan & Mulai
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="image-manager">
      {/* Header */}
      <div className="image-manager-header">
        <h1>📸 Manajemen Gambar</h1>
        <div className="image-manager-header-actions">
          <span className="image-count">{images.length} gambar tersimpan</span>
          <button
            className="btn btn-sm imgbb-config-btn"
            onClick={() => {
              setApiKeyInput(apiKey);
              setShowApiSetup(true);
            }}
            title="Ubah API Key"
          >
            ⚙️ API Key
          </button>
        </div>
      </div>

      {/* API Key modal */}
      {showApiSetup && (
        <div className="modal-overlay" onClick={() => setShowApiSetup(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>🔑 Ubah API Key ImgBB</h3>
            <input
              type="text"
              placeholder="API Key ImgBB..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="imgbb-key-input"
              autoFocus
            />
            <div className="modal-actions">
              <button className="btn btn-sm" onClick={() => setShowApiSetup(false)}>
                Batal
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleSaveApiKey}>
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload area */}
      <div
        className={`upload-dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="dropzone-content">
            <div className="upload-spinner" />
            <p>Mengupload gambar...</p>
          </div>
        ) : (
          <div className="dropzone-content">
            <div className="dropzone-icon">🖼️</div>
            <p className="dropzone-title">
              {dragOver ? "Lepaskan untuk upload" : "Klik atau drag & drop gambar di sini"}
            </p>
            <p className="dropzone-subtitle">PNG, JPG, GIF, WebP — bisa banyak sekaligus</p>
          </div>
        )}
      </div>

      {/* Gallery */}
      {images.length === 0 ? (
        <div className="gallery-empty">
          <div className="gallery-empty-icon">📂</div>
          <p>Belum ada gambar yang diupload.</p>
          <p className="gallery-empty-sub">Upload gambar di atas untuk mulai.</p>
        </div>
      ) : (
        <div className="image-gallery-grid">
          {images.map((img) => (
            <div key={img.id} className="image-gallery-card">
              <div
                className="image-gallery-thumb-wrap"
                onClick={() => setPreviewImage(img)}
              >
                <img
                  src={img.thumb || img.url}
                  alt={img.name}
                  className="image-gallery-thumb"
                  loading="lazy"
                />
                <div className="image-gallery-overlay">
                  <span>🔍 Lihat</span>
                </div>
              </div>
              <div className="image-gallery-info">
                <p className="image-gallery-name" title={img.name}>
                  {img.name}
                </p>
                <p className="image-gallery-meta">
                  {formatBytes(img.size)} · {formatDate(img.uploadedAt)}
                </p>
                <div className="image-gallery-actions">
                  <button
                    className={`copy-url-btn ${copiedId === img.id ? "copied" : ""}`}
                    onClick={() => handleCopyUrl(img)}
                    title="Salin URL gambar"
                  >
                    {copiedId === img.id ? "✅ Disalin!" : "📋 Copy URL"}
                  </button>
                  <button
                    className="delete-img-btn"
                    onClick={() => handleDelete(img.id)}
                    title="Hapus dari daftar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview modal */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="preview-modal" onClick={(e) => e.stopPropagation()}>
            <button className="preview-close" onClick={() => setPreviewImage(null)}>✕</button>
            <img src={previewImage.url} alt={previewImage.name} className="preview-img" />
            <div className="preview-info">
              <p className="preview-name">{previewImage.name}</p>
              <p className="preview-url">{previewImage.url}</p>
              <div className="modal-actions">
                <button
                  className={`copy-url-btn ${copiedId === previewImage.id ? "copied" : ""}`}
                  onClick={() => handleCopyUrl(previewImage)}
                >
                  {copiedId === previewImage.id ? "✅ URL Disalin!" : "📋 Copy URL"}
                </button>
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  🔗 Buka di tab baru
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
