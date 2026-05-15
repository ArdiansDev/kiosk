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
