import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCategories, deleteCategory } from "../api/categories";
import toast from "react-hot-toast";

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      return;
    }

    try {
      await deleteCategory(id);
      setCategories(categories.filter((item) => item.id !== id));
      toast.success("Kategori berhasil dihapus");
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="category-list">
      <div className="page-header">
        <h1>Kelola Kategori</h1>
        <Link to="/categories/new" className="btn btn-primary">
          Tambah Kategori
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nama</th>
            <th>Slug</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.name}</td>
              <td>{item.slug}</td>
              <td>
                <Link to={`/categories/${item.id}/edit`} className="btn btn-sm">
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="btn btn-sm btn-danger"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}