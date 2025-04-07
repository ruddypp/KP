-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('AVAILABLE', 'USED', 'MAINTENANCE', 'DAMAGED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kategori" (
    "id" TEXT NOT NULL,
    "namaKategori" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kategori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Barang" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeriBarang" (
    "id" TEXT NOT NULL,
    "barangId" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'AVAILABLE',
    "jumlah" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeriBarang_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestPenggunaan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seriId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "alasan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestPenggunaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestMaintenance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "seriBarangId" TEXT NOT NULL,
    "alasanPerbaikan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RequestMaintenance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LogAktivitas" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aksi" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "barangId" TEXT,
    "seriId" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LogAktivitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Kategori_namaKategori_key" ON "Kategori"("namaKategori");

-- CreateIndex
CREATE UNIQUE INDEX "SeriBarang_serialNumber_key" ON "SeriBarang"("serialNumber");

-- AddForeignKey
ALTER TABLE "Barang" ADD CONSTRAINT "Barang_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "Kategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeriBarang" ADD CONSTRAINT "SeriBarang_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestPenggunaan" ADD CONSTRAINT "RequestPenggunaan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestPenggunaan" ADD CONSTRAINT "RequestPenggunaan_seriId_fkey" FOREIGN KEY ("seriId") REFERENCES "SeriBarang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestMaintenance" ADD CONSTRAINT "RequestMaintenance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestMaintenance" ADD CONSTRAINT "RequestMaintenance_seriBarangId_fkey" FOREIGN KEY ("seriBarangId") REFERENCES "SeriBarang"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAktivitas" ADD CONSTRAINT "LogAktivitas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAktivitas" ADD CONSTRAINT "LogAktivitas_barangId_fkey" FOREIGN KEY ("barangId") REFERENCES "Barang"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LogAktivitas" ADD CONSTRAINT "LogAktivitas_seriId_fkey" FOREIGN KEY ("seriId") REFERENCES "SeriBarang"("id") ON DELETE SET NULL ON UPDATE CASCADE;
