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

## Fitur Admin

- Login admin tersedia di `/admin/login`.
- Panel admin tersedia di `/admin`.
- Filter data antrean tersedia untuk mode harian, mingguan, dan bulanan.
- Ekspor data dilakukan lewat tombol `Export CSV` di panel admin.

## Konfigurasi Login Admin

- Kredensial admin diambil dari `.env`.
- Untuk lokal, default yang dipakai saat ini adalah `ADMIN_USERNAME=admin`.
- Ganti `ADMIN_PASSWORD` dan `ADMIN_SESSION_SECRET` sebelum dipakai di lingkungan selain lokal.

## Prisma

- File schema ada di `prisma/schema.prisma`.
- Database lokal memakai `DATABASE_URL="file:./prisma/dev.db"` dari `.env`.
- Prisma Studio bisa dijalankan dengan `npm run prisma:studio`.
