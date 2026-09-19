import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import Image from "@tiptap/extension-image";
import { getNewsById, createNews, updateNews } from "../api/news";
import { getCategories } from "../api/categories";
import { uploadImage } from "../api/images";
import toast from "react-hot-toast";

const IMGBB_API_KEY_STORAGE = "imgbb_api_key";

export default function NewsForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    author: "",
    imageUrl: "",
    publishedAt: "",
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alignmentDropdownOpen, setAlignmentDropdownOpen] = useState(false);
  const [alignmentDropdownPosition, setAlignmentDropdownPosition] = useState({ top: 0, left: 0 });
  const [currentFontFamily, setCurrentFontFamily] = useState('');
  const [currentTextColor, setCurrentTextColor] = useState('#000000');
  const [currentHighlightColor, setCurrentHighlightColor] = useState(null);
  const [textColorDropdownOpen, setTextColorDropdownOpen] = useState(false);
  const [highlightDropdownOpen, setHighlightDropdownOpen] = useState(false);
  const [thumbnailUploading, setThumbnailUploading] = useState(false);
  const [thumbnailDragOver, setThumbnailDragOver] = useState(false);

  const alignmentButtonRef = useRef(null);
  const textColorButtonRef = useRef(null);
  const highlightButtonRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);

        if (isEdit) {
          const newsData = await getNewsById(id);
          setFormData({
            title: newsData.title,
            slug: newsData.slug,
            excerpt: newsData.excerpt,
            content: newsData.content,
            category: newsData.category.toString(),
            author: newsData.author,
            imageUrl: newsData.imageUrl,
            publishedAt: newsData.publishedAt
              ? new Date(newsData.publishedAt).toISOString().split("T")[0]
              : "",
          });
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    setFormData((prev) => ({ ...prev, content: value }));
  };

  const handleThumbnailFiles = useCallback(async (files) => {
    const file = Array.from(files).find((f) => f.type.startsWith("image/"));
    if (!file) {
      toast.error("Hanya file gambar yang diperbolehkan.");
      return;
    }
    const apiKey = localStorage.getItem(IMGBB_API_KEY_STORAGE);
    if (!apiKey) {
      toast.error("API Key ImgBB belum dikonfigurasi. Buka halaman Manajemen Gambar untuk mengatur API Key terlebih dahulu.");
      return;
    }
    setThumbnailUploading(true);
    try {
      const result = await uploadImage(file, apiKey);
      setFormData((prev) => ({ ...prev, imageUrl: result.url }));
      toast.success("Gambar sampul berhasil diupload!");
    } catch (err) {
      toast.error(`Gagal upload: ${err.message}`);
    } finally {
      setThumbnailUploading(false);
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
      }),
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Image,
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      handleContentChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && formData.content !== editor.getHTML()) {
      editor.commands.setContent(formData.content);
    }
  }, [formData.content, editor]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (alignmentDropdownOpen && !event.target.closest('.alignment-dropdown')) {
        setAlignmentDropdownOpen(false);
      }
      if (textColorDropdownOpen && !event.target.closest('.text-color-dropdown')) {
        setTextColorDropdownOpen(false);
      }
      if (highlightDropdownOpen && !event.target.closest('.highlight-dropdown')) {
        setHighlightDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [alignmentDropdownOpen, textColorDropdownOpen, highlightDropdownOpen]);

  useEffect(() => {
    if (alignmentDropdownOpen && alignmentButtonRef.current) {
      const rect = alignmentButtonRef.current.getBoundingClientRect();
      setAlignmentDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left
      });
    }
  }, [alignmentDropdownOpen]);

  useEffect(() => {
    if (!editor) return;

    const updateCurrentStyles = () => {
      // Get current text style attributes from cursor position
      const textStyle = editor.getAttributes('textStyle');

      // Get current font family
      const fontFamily = textStyle.fontFamily || '';
      setCurrentFontFamily(fontFamily);

      // Get current text color
      const textColor = textStyle.color || '#000000';
      setCurrentTextColor(textColor);

      // Get current highlight color from highlight mark
      // Check isActive first to confirm highlight mark actually exists at cursor/selection
      const isHighlightActive = editor.isActive('highlight');
      if (isHighlightActive) {
        const highlightAttributes = editor.getAttributes('highlight');
        // highlightAttributes.color may be undefined for non-multicolor highlight
        setCurrentHighlightColor(highlightAttributes.color || '#ffff00');
      } else {
        // No highlight applied — use null to signal "no highlight"
        setCurrentHighlightColor(null);
      }
    };

    // Initial update
    updateCurrentStyles();

    // Listen for selection changes and transactions
    editor.on('selectionUpdate', updateCurrentStyles);
    editor.on('transaction', updateCurrentStyles);

    return () => {
      editor.off('selectionUpdate', updateCurrentStyles);
      editor.off('transaction', updateCurrentStyles);
    };
  }, [editor]);

  const MenuBar = () => {
    if (!editor) {
      return null;
    }

    return (
      <div className="tiptap-toolbar">
        {/* Font Family */}
        <select
          value={currentFontFamily}
          onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
          title="Font Family"
          className="toolbar-select"
        >
          <option value="">Font</option>
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>

        {/* Text Formatting */}
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Underline"
        >
          <u>U</u>
        </button>

        {/* Alignment Dropdown */}
        <div className="alignment-dropdown">
          <button
            ref={alignmentButtonRef}
            onClick={() => setAlignmentDropdownOpen(!alignmentDropdownOpen)}
            className="alignment-dropdown-button"
            title="Text Alignment"
          >
            <span className="alignment-icon">
              {editor.isActive({ textAlign: 'left' }) && '⫷'}
              {editor.isActive({ textAlign: 'center' }) && '≡'}
              {editor.isActive({ textAlign: 'right' }) && '⫸'}
              {editor.isActive({ textAlign: 'justify' }) && '≡'}
              {!editor.isActive({ textAlign: 'left' }) &&
               !editor.isActive({ textAlign: 'center' }) &&
               !editor.isActive({ textAlign: 'right' }) &&
               !editor.isActive({ textAlign: 'justify' }) && '⫷'}
            </span>
            <span className="dropdown-arrow">▼</span>
          </button>
          {alignmentDropdownOpen && (
            <div
              className="alignment-dropdown-menu"
              style={{
                top: `${alignmentDropdownPosition.top}px`,
                left: `${alignmentDropdownPosition.left}px`
              }}
            >
              <button
                onClick={() => {
                  editor.chain().focus().setTextAlign('left').run();
                  setAlignmentDropdownOpen(false);
                }}
                className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
                title="Align Left"
              >
                ⫷
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setTextAlign('center').run();
                  setAlignmentDropdownOpen(false);
                }}
                className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
                title="Align Center"
              >
                ≡
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setTextAlign('right').run();
                  setAlignmentDropdownOpen(false);
                }}
                className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
                title="Align Right"
              >
                ⫸
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setTextAlign('justify').run();
                  setAlignmentDropdownOpen(false);
                }}
                className={editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}
                title="Justify"
              >
                ≡
              </button>
            </div>
          )}
        </div>

        {/* Text Color Dropdown */}
        <div className="text-color-dropdown">
          <button
            ref={textColorButtonRef}
            onClick={() => setTextColorDropdownOpen(!textColorDropdownOpen)}
            className="text-color-dropdown-trigger"
            title="Text Color"
          >
            <span
              className="text-color-swatch"
              style={{ backgroundColor: currentTextColor }}
            />
            <span className="dropdown-arrow">▼</span>
          </button>
          {textColorDropdownOpen && (
            <div className="text-color-dropdown-menu">
              <div className="highlight-dropdown-label">Warna Teks</div>
              {/* Default / Reset option */}
              <button
                className={`highlight-no-color ${currentTextColor === '#000000' ? 'is-active' : ''}`}
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setTextColorDropdownOpen(false);
                }}
                title="Reset ke warna default"
              >
                <span
                  className="no-color-swatch"
                  style={{
                    background: '#000',
                    border: 'none',
                  }}
                >
                  <span style={{ fontSize: 10, color: '#fff', lineHeight: 1 }}>A</span>
                </span>
                <span>Default (Hitam)</span>
              </button>
              {/* Preset colors */}
              <div className="highlight-swatches">
                {[
                  { color: '#000000', label: 'Hitam' },
                  { color: '#374151', label: 'Abu gelap' },
                  { color: '#6b7280', label: 'Abu' },
                  { color: '#ef4444', label: 'Merah' },
                  { color: '#f97316', label: 'Oranye' },
                  { color: '#eab308', label: 'Kuning' },
                  { color: '#22c55e', label: 'Hijau' },
                  { color: '#3b82f6', label: 'Biru' },
                  { color: '#8b5cf6', label: 'Ungu' },
                  { color: '#ec4899', label: 'Pink' },
                  { color: '#0f3460', label: 'Navy' },
                  { color: '#e94560', label: 'Merah gelap' },
                ].map(({ color, label }) => (
                  <button
                    key={color}
                    className={`swatch-btn ${currentTextColor === color ? 'swatch-active' : ''}`}
                    style={{ backgroundColor: color }}
                    title={label}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setTextColorDropdownOpen(false);
                    }}
                  />
                ))}
              </div>
              {/* Custom color picker */}
              <div className="highlight-custom-color">
                <label>Warna lain:</label>
                <input
                  type="color"
                  defaultValue={currentTextColor}
                  onChange={(e) => {
                    editor.chain().focus().setColor(e.target.value).run();
                  }}
                  onBlur={() => setTextColorDropdownOpen(false)}
                  title="Pilih warna teks kustom"
                  className="custom-color-input"
                />
              </div>
            </div>
          )}
        </div>
        <div className="highlight-dropdown">
          <button
            ref={highlightButtonRef}
            onClick={() => setHighlightDropdownOpen(!highlightDropdownOpen)}
            className={`highlight-dropdown-trigger ${currentHighlightColor ? 'is-active' : ''}`}
            title="Highlight / Background Color"
          >
            <span
              className="highlight-swatch"
              style={{
                backgroundColor: currentHighlightColor || 'transparent',
                border: currentHighlightColor ? 'none' : '1.5px dashed #aaa',
              }}
            />
            <span className="dropdown-arrow">▼</span>
          </button>
          {highlightDropdownOpen && (
            <div className="highlight-dropdown-menu">
              <div className="highlight-dropdown-label">Background / Highlight</div>
              {/* No Color option */}
              <button
                className={`highlight-no-color ${!currentHighlightColor ? 'is-active' : ''}`}
                onClick={() => {
                  editor.chain().focus().unsetHighlight().run();
                  setHighlightDropdownOpen(false);
                }}
                title="Hapus highlight"
              >
                <span className="no-color-swatch">
                  <span className="no-color-cross">✕</span>
                </span>
                <span>Tidak ada</span>
              </button>
              {/* Preset colors */}
              <div className="highlight-swatches">
                {[
                  { color: '#ffff00', label: 'Kuning' },
                  { color: '#90EE90', label: 'Hijau muda' },
                  { color: '#ADD8E6', label: 'Biru muda' },
                  { color: '#FFB6C1', label: 'Merah muda' },
                  { color: '#FFA500', label: 'Oranye' },
                  { color: '#E6E6FA', label: 'Lavender' },
                  { color: '#ffffff', label: 'Putih' },
                  { color: '#d3d3d3', label: 'Abu-abu' },
                ].map(({ color, label }) => (
                  <button
                    key={color}
                    className={`swatch-btn ${currentHighlightColor === color ? 'swatch-active' : ''}`}
                    style={{ backgroundColor: color, border: color === '#ffffff' ? '1px solid #ddd' : 'none' }}
                    title={label}
                    onClick={() => {
                      editor.chain().focus().setHighlight({ color }).run();
                      setHighlightDropdownOpen(false);
                    }}
                  />
                ))}
              </div>
              {/* Custom color picker */}
              <div className="highlight-custom-color">
                <label>Warna lain:</label>
                <input
                  type="color"
                  defaultValue={currentHighlightColor || '#ffff00'}
                  onChange={(e) => {
                    editor.chain().focus().setHighlight({ color: e.target.value }).run();
                  }}
                  onBlur={() => setHighlightDropdownOpen(false)}
                  title="Pilih warna kustom"
                  className="custom-color-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Lists */}
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Bullet List"
        >
          •
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Numbered List"
        >
          1.
        </button>

        {/* Insert */}
        <button
          onClick={() => {
            const url = window.prompt('Enter link URL:');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Add Link"
        >
          🔗
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter image URL:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          title="Add Image"
        >
          🖼️
        </button>

        {/* Undo/Redo */}
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          ↶
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          ↷
        </button>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        category: Number.parseInt(formData.category, 10),
        publishedAt: formData.publishedAt || new Date().toISOString(),
      };

      if (isEdit) {
        await updateNews(id, data);
        toast.success("Berita berhasil diperbarui");
      } else {
        await createNews(data);
        toast.success("Berita berhasil ditambahkan");
      }

      navigate("/news");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="news-form">
      <h1>{isEdit ? "Edit Berita" : "Tambah Berita Baru"}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Judul</label>
          <input
            id="title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="slug">Slug</label>
          <input
            id="slug"
            name="slug"
            type="text"
            value={formData.slug}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="category">Kategori</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Pilih Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="author">Penulis</label>
          <input
            id="author"
            name="author"
            type="text"
            value={formData.author}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Gambar Sampul</label>
          {/* Upload zone */}
          <div
            className={`thumbnail-upload-zone ${thumbnailDragOver ? "drag-over" : ""} ${thumbnailUploading ? "uploading" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setThumbnailDragOver(true); }}
            onDragLeave={() => setThumbnailDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setThumbnailDragOver(false); handleThumbnailFiles(e.dataTransfer.files); }}
            onClick={() => !thumbnailUploading && thumbnailInputRef.current?.click()}
          >
            <input
              ref={thumbnailInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleThumbnailFiles(e.target.files)}
            />
            {thumbnailUploading ? (
              <div className="thumbnail-upload-inner">
                <div className="upload-spinner" />
                <span className="thumbnail-upload-hint">Mengupload...</span>
              </div>
            ) : formData.imageUrl ? (
              <div className="thumbnail-preview-wrap">
                <img src={formData.imageUrl} alt="Preview sampul" className="thumbnail-preview-img" />
                <div className="thumbnail-preview-overlay">
                  <span>🔄 Klik atau drag untuk ganti gambar</span>
                </div>
              </div>
            ) : (
              <div className="thumbnail-upload-inner">
                <span className="thumbnail-upload-icon">🖼️</span>
                <span className="thumbnail-upload-label">
                  {thumbnailDragOver ? "Lepaskan untuk upload" : "Klik atau drag & drop gambar sampul"}
                </span>
                <span className="thumbnail-upload-hint">PNG, JPG, WebP, GIF — maks 32 MB</span>
              </div>
            )}
          </div>
          {/* Manual URL input */}
          <div className="thumbnail-url-row">
            <input
              id="imageUrl"
              name="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="Atau tempel URL gambar langsung..."
              className="thumbnail-url-input"
            />
            {formData.imageUrl && (
              <button
                type="button"
                className="thumbnail-clear-btn"
                onClick={() => setFormData((prev) => ({ ...prev, imageUrl: "" }))}
                title="Hapus gambar"
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="excerpt">Ringkasan</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            required
            rows={3}
          />
        </div>
        <div className="form-group">
          <label htmlFor="content">Konten</label>
          <div className="rich-text-editor">
            <MenuBar />
            <EditorContent editor={editor} />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="publishedAt">Tanggal Publish</label>
          <input
            id="publishedAt"
            name="publishedAt"
            type="date"
            value={formData.publishedAt}
            onChange={handleChange}
          />
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => navigate("/news")}>
            Batal
          </button>
          <button type="submit" disabled={submitting}>
            {submitting ? "Menyimpan..." : isEdit ? "Update" : "Simpan"}
          </button>
        </div>
      </form>
    </div>
  );
}