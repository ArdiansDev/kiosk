# Kiosk Self Service PLN

Proyek ini memakai Next.js App Router untuk alur kiosk pelanggan dan sekarang sudah dilengkapi penyimpanan antrean berbasis SQLite dengan Prisma.

## Menjalankan Proyek

1. Install dependensi.

```bash
npm install
```

2. Buat database SQLite dan generate Prisma Client.

```bash
npm run prisma:migrate -- --name init_queue_admin
```

3. Jalankan aplikasi.

```bash
npm run dev
```

## Menjalankan Sebagai Electron

Karena aplikasi ini memakai App Router, API route, dan Prisma SQLite, mode Electron yang aman bukan `next export`, tetapi menjalankan server Next lokal di dalam proses Electron.

1. Untuk menjalankan web app dan server bersama, jalankan:

```bash
npm run dev:web
```

Default base port adalah `3100`, tetapi script web akan pindah ke port kosong lain bila port itu sudah dipakai. Electron membaca URL aktual dari proses web, jadi dua app tetap sinkron ke server yang sama.

2. Untuk membuka Electron yang memakai server web yang sama, jalankan di terminal lain:

```bash
npm run dev:electron
```

3. Jika ingin browser dan Electron sama-sama hidup dengan satu command, jalankan:

```bash
npm run electron:dev
```

Alias `npm run dev:all` menjalankan mode yang sama. Dalam setup ini, proses web adalah server utamanya, lalu Electron hanya menjadi client desktop yang memakai URL web tersebut.

4. Untuk build desktop Windows, jalankan:

```bash
npm run electron:build
```

Catatan:

- Build Next memakai `output: "standalone"` agar runtime server bisa dibundel ke Electron.
- Database SQLite awal diambil dari `prisma/prisma/dev.db`, lalu saat aplikasi Electron dijalankan akan disalin ke folder writable milik aplikasi.
- Jika `ELECTRON_API_BASE_URL` di-set, route kiosk `POST /api/queue` pada server lokal Electron akan diproxy ke webserver pusat. Dengan begitu UI dan asset tetap lokal/offline dari Electron, tetapi pencatatan data antrean masuk ke server web pusat.
- Jika butuh kredensial admin atau mode environment tertentu di desktop build, tetap set `APP_ENV`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`, dan `ADMIN_SESSION_SECRET` di environment sebelum menjalankan build/aplikasi.

Contoh:

```bash
ELECTRON_API_BASE_URL=https://kiosk-api.example.com npm run electron:build
```

Untuk packaged app, URL API juga bisa dibaca saat runtime dari file `electron-config.json` di folder `userData` Electron dengan isi seperti berikut:

```json
{
  "apiBaseUrl": "https://kiosk-api.example.com"
}
```

## Build Electron untuk Produksi

Untuk membuat installer Windows yang siap didistribusikan, ikuti langkah berikut:

### Persiapan Build

1. Pastikan semua dependensi sudah terinstall:

```bash
npm install
```

2. Pastikan database sudah di-migrate:

```bash
npm run prisma:migrate -- --name init_queue_admin
```

3. (Opsional) Set environment variables jika butuh konfigurasi khusus:

```bash
# Windows PowerShell
$env:ELECTRON_API_BASE_URL="https://kiosk-api.example.com"
$env:APP_ENV="admin"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="your-secure-password"
$env:ADMIN_SESSION_SECRET="your-secret-key"

# Linux/Mac
export ELECTRON_API_BASE_URL="https://kiosk-api.example.com"
export APP_ENV="admin"
export ADMIN_USERNAME="admin"
export ADMIN_PASSWORD="your-secure-password"
export ADMIN_SESSION_SECRET="your-secret-key"
```

### Proses Build

Jalankan command berikut untuk build aplikasi Electron:

```bash
npm run electron:build
```

Command ini akan:

1. Build aplikasi Next.js dengan mode `standalone` (`npm run build`)
2. Menyiapkan file-file yang dibutuhkan untuk Electron (`prepare-electron-build.cjs`)
3. Package aplikasi menjadi installer Windows menggunakan `electron-builder`

### Output Build

Setelah build selesai, installer akan tersedia di folder `dist-electron/`:

- `PLN Kiosk Setup X.X.X.exe` - Installer NSIS untuk Windows
- `win-unpacked/` - Folder berisi aplikasi yang sudah di-unpack (untuk testing tanpa install)

### Testing Build

Untuk test aplikasi tanpa install:

1. Buka folder `dist-electron/win-unpacked/`
2. Jalankan `PLN Kiosk.exe`

Untuk test installer:

1. Jalankan file `PLN Kiosk Setup X.X.X.exe`
2. Ikuti proses instalasi
3. Aplikasi akan terinstall dan bisa dijalankan dari Start Menu atau Desktop

### Troubleshooting Build

**Error: Prisma Client tidak ditemukan**

- Jalankan `npm run prisma:generate` sebelum build
- Pastikan file `prisma/prisma/dev.db` ada

**Error: Port sudah terpakai**

- Pastikan tidak ada proses `npm run dev` atau server Next.js yang masih berjalan
- Kill proses yang menggunakan port 3100

**Aplikasi tidak bisa connect ke API**

- Cek file `electron-config.json` di folder userData (biasanya di `C:\Users\[Username]\AppData\Roaming\PLN Kiosk\`)
- Pastikan `apiBaseUrl` sudah benar
- Atau set environment variable `ELECTRON_API_BASE_URL` sebelum build

**Database tidak bisa diakses**

- Database akan disalin dari `prisma/prisma/dev.db` ke folder aplikasi saat pertama kali dijalankan
- Folder database aplikasi biasanya di `C:\Users\[Username]\AppData\Roaming\PLN Kiosk\`

## Fitur Admin

- Login admin tersedia di `/admin/login`.
- Panel admin tersedia di `/admin`.
- Filter data antrean tersedia untuk mode harian, mingguan, dan bulanan.
- Ekspor data dilakukan lewat tombol `Export CSV` di panel admin.

## Konfigurasi Login Admin

- Fitur admin hanya aktif saat `APP_ENV=admin`.
- Kredensial admin diambil dari `.env`.
- Untuk lokal, default yang dipakai saat ini adalah `ADMIN_USERNAME=admin`.
- Untuk env kiosk atau publik, gunakan nilai selain `admin` pada `APP_ENV` agar route admin tidak bisa dibuka.
- Ganti `ADMIN_PASSWORD` dan `ADMIN_SESSION_SECRET` sebelum dipakai di lingkungan selain lokal.

## Prisma

- File schema ada di `prisma/schema.prisma`.
- Database lokal memakai `DATABASE_URL="file:./prisma/dev.db"` dari `.env`.
- Prisma Studio bisa dijalankan dengan `npm run prisma:studio`.
