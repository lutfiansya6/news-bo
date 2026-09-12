import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import NewsList from "./pages/NewsList";
import NewsForm from "./pages/NewsForm";
import CategoryList from "./pages/CategoryList";
import CategoryForm from "./pages/CategoryForm";
import CommentModeration from "./pages/CommentModeration";
import { Toaster } from "react-hot-toast";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="news" element={<NewsList />} />
            <Route path="news/new" element={<NewsForm />} />
            <Route path="news/:id/edit" element={<NewsForm />} />
            <Route path="categories" element={<CategoryList />} />
            <Route path="categories/new" element={<CategoryForm />} />
            <Route path="categories/:id/edit" element={<CategoryForm />} />
            <Route path="comments" element={<CommentModeration />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
