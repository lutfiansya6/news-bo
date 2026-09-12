import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNewsList, deleteNews } from "../api/news";
import { getCategories } from "../api/categories";
import toast from "react-hot-toast";

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [newsData, categoriesData] = await Promise.all([
          getNewsList(),
          getCategories(),
        ]);
        setNews(newsData);
        setCategories(categoriesData);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      return;
    }

    try {
      await deleteNews(id);
      setNews(news.filter((item) => item.id !== id));
      toast.success("Berita berhasil dihapus");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="news-list">
      <div className="page-header">
        <h1>Kelola Berita</h1>
        <Link to="/news/new" className="btn btn-primary">
          Tambah Berita
        </Link>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Judul</th>
            <th>Kategori</th>
            <th>Penulis</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{getCategoryName(item.category)}</td>
              <td>{item.author}</td>
              <td>
                <Link to={`/news/${item.id}/edit`} className="btn btn-sm">
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