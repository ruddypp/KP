# Sistem Inventaris PT. Paramata

Sistem manajemen inventaris modern yang dibangun menggunakan Next.js 14, dirancang untuk PT. Paramata dengan fitur realtime dan autentikasi berbasis peran.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Bahasa**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Autentikasi**: NextAuth.js (Role-based: Admin, User)
- **State Management & Data Fetching**: React Query (`@tanstack/react-query`)
- **Form Handling & Validation**: React Hook Form & Zod
- **Realtime**: Pusher
- **Charting**: Recharts

## Fitur Utama

- **Autentikasi Berbasis Peran**: Login/Logout terpisah untuk Admin dan User.
- **Manajemen Kategori**: Operasi CRUD (Create, Read, Update, Delete) untuk kategori barang.
- **Manajemen Barang**: Operasi CRUD (Create, Read, Update, Delete) untuk jenis barang.
- **Manajemen Unit/Seri Barang**: 
    - Pelacakan barang individual berdasarkan Serial Number (via model `SeriBarang`).
    - Tampilan daftar unit/seri per barang melalui fitur *expand* di tabel barang.
    - (TODO: CRUD untuk SeriBarang)
- **Validasi Form**: Menggunakan Zod untuk skema validasi yang kuat.
- **Sidebar Dinamis**: Menampilkan menu navigasi yang sesuai dengan peran pengguna.
- **Notifikasi**: Sistem notifikasi dasar (terlihat di navbar, backend perlu dikembangkan lebih lanjut).
- **Middleware**: Melindungi rute berdasarkan peran pengguna.
- **Logging Aktivitas**: Pencatatan aksi penting pengguna (misal: tambah/edit/hapus barang/kategori).
- **Dark/Light Mode**: Toggle tema.
- **Fitur dalam Pengembangan/Rencana**: Dashboard Admin, Request Penggunaan Barang (User), Maintenance (Admin & User), Laporan & Statistik.

## Setup Project

1.  **Clone repository**
    ```bash
    git clone [repository-url]
    cd project-paramata
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Setup environment variables**
    Salin `.env.example` menjadi `.env`.
    ```bash
    cp .env.example .env
    ```
    Edit file `.env` dan isi variabel yang diperlukan (minimal `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, dan kredensial Pusher jika digunakan).

4.  **Setup database**
    Pastikan server PostgreSQL Anda berjalan.
    ```bash
    npx prisma generate
    npx prisma db push
    ```
    *Catatan: `db push` cocok untuk development. Untuk produksi, gunakan `prisma migrate deploy`.* 

5.  **Jalankan development server**
    ```bash
    npm run dev
    ```
    Aplikasi akan tersedia di `http://localhost:3000`.

## Struktur Project (Ringkasan)

```
src/
├── app/                      # Rute Aplikasi (App Router)
│   ├── (auth)/               # Rute terkait autentikasi (misal: /login)
│   ├── (dashboard)/          # Layout dan Rute untuk halaman setelah login
│   │   ├── admin/            # Rute khusus Admin
│   │   └── user/             # Rute khusus User
│   ├── api/                  # API Routes
│   └── layout.tsx            # Layout utama aplikasi
│   └── page.tsx              # Halaman utama (jika ada)
├── components/               # Komponen UI (shared, ui, spesifik fitur)
├── hooks/                    # Custom React Hooks
├── lib/                      # Utilitas (Prisma client, utils, auth options, pusher)
├── prisma/                   # Skema dan migrasi database Prisma
└── middleware.ts             # Middleware (Autentikasi & Otorisasi Rute)
.env                          # Variabel Lingkungan (JANGAN DI-COMMIT)
.gitignore                    # File/Folder yang diabaikan Git
next.config.js                # Konfigurasi Next.js
package.json                  # Dependensi dan skrip proyek
postcss.config.js             # Konfigurasi PostCSS
tailwind.config.ts            # Konfigurasi Tailwind CSS
tsconfig.json                 # Konfigurasi TypeScript
README.md                     # File ini
```

## Kontribusi

1.  Fork repository
2.  Buat branch fitur (`git checkout -b feature/NamaFitur`)
3.  Commit perubahan (`git commit -m 'feat: Menambahkan Fitur Keren'`)
4.  Push ke branch (`git push origin feature/NamaFitur`)
5.  Buat Pull Request

## Lisensi

Distributed under the MIT License. See `LICENSE` for more information.
