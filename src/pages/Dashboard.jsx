import { useEffect, useState } from "react";
import { getNewsList } from "../api/news";
import { getComments } from "../api/comments";
import { getCategories } from "../api/categories";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalNews: 0,
    totalCategories: 0,
    totalComments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [news, comments, categories] = await Promise.all([
          getNewsList(),
          getComments(),
          getCategories(),
        ]);

        setStats({
          totalNews: news.length,
          totalCategories: categories.length,
          totalComments: comments.length,
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Berita</h3>
          <p className="stat-number">{stats.totalNews}</p>
        </div>
        <div className="stat-card">
          <h3>Total Kategori</h3>
          <p className="stat-number">{stats.totalCategories}</p>
        </div>
        <div className="stat-card">
          <h3>Total Komentar</h3>
          <p className="stat-number">{stats.totalComments}</p>
        </div>
      </div>
    </div>
  );
}
