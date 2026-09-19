import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNewsList, deleteNews } from "../api/news";
import { getCategories } from "../api/categories";
import Pagination from "../components/Pagination";
import toast from "react-hot-toast";

const LIMIT = 10;

export default function NewsList() {
  const [news, setNews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadData = async (targetPage, categoryFilter) => {
    setLoading(true);
    try {
      const [newsRes, categoriesData] = await Promise.all([
        getNewsList(categoryFilter, targetPage, LIMIT),
        getCategories(),
      ]);
      const newsData = newsRes.data ?? newsRes;
      const pagination = newsRes.pagination ?? { totalPages: 1, total: newsData.length };
      setNews(newsData);
      setTotalPages(pagination.totalPages);
      setTotal(pagination.total);
      setCategories(categoriesData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial load and category change
  useEffect(() => {
    setPage(1);
    loadData(1, selectedCategory);
  }, [selectedCategory]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    loadData(newPage, selectedCategory);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus berita ini?")) {
      return;
    }

    try {
      await deleteNews(id);
      toast.success("Berita berhasil dihapus");

      // If deleting the last item on this page and not on page 1, go back one page
      const remainingOnPage = news.length - 1;
      if (remainingOnPage === 0 && page > 1) {
        const prevPage = page - 1;
        setPage(prevPage);
        loadData(prevPage, selectedCategory);
      } else {
        loadData(page, selectedCategory);
      }
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
      <div className="page-toolbar">
        <label>
          <span>Filter Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </label>
        <span className="news-list-count">
          {total} berita Â· halaman {page} dari {totalPages}
        </span>
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

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
