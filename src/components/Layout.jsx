import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { username, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p className="username">{username}</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={isActive("/dashboard") ? "active" : ""}>
            Dashboard
          </Link>
          <Link to="/news" className={isActive("/news") ? "active" : ""}>
            Berita
          </Link>
          <Link to="/categories" className={isActive("/categories") ? "active" : ""}>
            Kategori
          </Link>
          <Link to="/comments" className={isActive("/comments") ? "active" : ""}>
            Komentar
          </Link>
          <Link to="/images" className={isActive("/images") ? "active" : ""}>
            Gambar
          </Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}