# Admin Panel - News Portal

Admin panel untuk mengelola berita, kategori, dan komentar pada News Portal.

## Fitur

- **Login Admin**: Otentikasi dengan JWT token
- **Dashboard**: Statistik overview (total berita, kategori, komentar, pending comments)
- **Kelola Berita**: CRUD berita (tambah, edit, hapus)
- **Kelola Kategori**: CRUD kategori (tambah, edit, hapus)
- **Moderasi Komentar**: Approve/reject/hapus komentar

## Credentials Default

- **Username**: `admin`
- **Password**: `admin123`

## Cara Menjalankan

### 1. Backend Server

```bash
cd be
npm start
```

Backend akan berjalan di `http://localhost:3000`

### 2. Admin Panel Frontend

```bash
cd bo
npm run dev
```

Admin panel akan berjalan di `http://localhost:5174`

## Struktur Project

### Backend (be/)
- `models/`: Database models (Admin, Category, News, Comment)
- `routes/`: API routes (admin, categories, comments, adminNews, news)
- `scripts/`: Database seeding scripts
- `server.js`: Main server file

### Frontend (bo/)
- `src/api/`: API integration modules
- `src/components/`: Reusable components (Layout, ProtectedRoute)
- `src/context/`: React context (AuthContext)
- `src/pages/`: Page components (Dashboard, News, Categories, Comments, Login)
- `src/App.jsx`: Main app with routing
- `src/App.css`: Global styles

## API Endpoints

### Authentication
- `POST /api/admin/login` - Login admin
- `GET /api/admin/verify` - Verify JWT token

### News (Admin)
- `GET /api/admin/news` - Get all news
- `GET /api/admin/news/:id` - Get single news
- `POST /api/admin/news` - Create news
- `PUT /api/admin/news/:id` - Update news
- `DELETE /api/admin/news/:id` - Delete news

### Categories
- `GET /api/admin/categories` - Get all categories
- `GET /api/admin/categories/:id` - Get single category
- `POST /api/admin/categories` - Create category
- `PUT /api/admin/categories/:id` - Update category
- `DELETE /api/admin/categories/:id` - Delete category

### Comments
- `GET /api/admin/comments` - Get all comments (with filters)
- `PUT /api/admin/comments/:id/approve` - Approve comment
- `PUT /api/admin/comments/:id/reject` - Reject comment
- `DELETE /api/admin/comments/:id` - Delete comment

### News (Public)
- `GET /api/news` - Get all news (public)
- `GET /api/news/:id` - Get single news (public)
- `GET /api/news/:id/comments` - Get approved comments for news
- `POST /api/news/:id/comments` - Post comment (public)

## Database Seeding

Untuk me-reset database dengan data awal:

```bash
cd be
node scripts/seedAdmin.js
```

Ini akan:
- Membuat admin user (username: admin, password: admin123)
- Membuat 5 kategori default (Teknologi, Bisnis, Olahraga, Hiburan, Politik)
- Update berita yang ada untuk menggunakan category ID

## Catatan Penting

1. **JWT Secret**: Disimpan di environment variable `JWT_SECRET` di file `.env` backend
2. **Password Admin**: Harap ganti password default di production
3. **Port Backend**: 3000
4. **Port Frontend**: 5174
5. **CORS**: Backend sudah dikonfigurasi untuk menerima request dari frontend
6. **Proxy**: Frontend menggunakan Vite proxy untuk forward API requests ke backend

## Troubleshooting

### Backend tidak bisa start
- Pastikan MongoDB connection string di `.env` sudah benar
- Pastikan port 3000 tidak digunakan oleh aplikasi lain

### Frontend tidak bisa connect ke backend
- Pastikan backend sudah berjalan di port 3000
- Cek Vite proxy configuration di `vite.config.js`

### Login gagal
- Pastikan admin user sudah dibuat (jalankan seed script)
- Cek username dan password default