import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCategoryById, createCategory, updateCategory } from "../api/categories";
import toast from "react-hot-toast";

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        if (isEdit) {
          const data = await getCategoryById(id);
          setFormData({
            name: data.name,
            slug: data.slug,
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
      if (isEdit) {
        await updateCategory(id, formData);
        toast.success("Kategori berhasil diperbarui");
      } else {
        await createCategory(formData);
        toast.success("Kategori berhasil ditambahkan");
      }

      navigate("/categories");
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
    <div className="category-form">
      <h1>{isEdit ? "Edit Kategori" : "Tambah Kategori Baru"}</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nama Kategori</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
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
        <div className="form-actions">
          <button type="button" onClick={() => navigate("/categories")}>
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