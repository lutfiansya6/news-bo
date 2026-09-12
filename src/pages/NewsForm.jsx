import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getNewsById, createNews, updateNews } from "../api/news";
import { getCategories } from "../api/categories";
import toast from "react-hot-toast";

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
            category: newsData.category,
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
          <label htmlFor="imageUrl">URL Gambar</label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={formData.imageUrl}
            onChange={handleChange}
            required
          />
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
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows={10}
          />
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