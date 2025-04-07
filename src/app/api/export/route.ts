import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import * as XLSX from "xlsx";
import { Prisma } from "@prisma/client";

type MaintenanceRow = {
  id: string;
  createdAt: Date;
  alasanPerbaikan: string;
  status: string;
  keterangan: string | null;
  userName: string;
  barangNama: string;
  serialNumber: string;
  namaKategori: string | null;
};

type StockRow = {
  id: string;
  serialNumber: string;
  status: string;
  jumlah: number;
  barangNama: string;
  namaKategori: string | null;
};

type ActivityRow = {
  id: string;
  createdAt: Date;
  aksi: string;
  detail: string;
  userName: string;
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

// GET: Export data ke Excel
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!type) {
      return NextResponse.json(
        { message: "Tipe export tidak valid" },
        { status: 400 }
      );
    }

    let data: Record<string, string | number>[] = [];
    let filename = "";

    if (type === "maintenance") {
      const maintenanceData = await prisma.$queryRaw<MaintenanceRow[]>`
        SELECT 
          m.id,
          m."createdAt",
          m."alasanPerbaikan",
          m.status,
          m.keterangan,
          u.name as "userName",
          b.nama as "barangNama",
          s."serialNumber",
          k."namaKategori"
        FROM "RequestMaintenance" m
        JOIN "User" u ON m."userId" = u.id
        JOIN "SeriBarang" s ON m."seriBarangId" = s.id
        JOIN "Barang" b ON s."barangId" = b.id
        LEFT JOIN "Kategori" k ON b."kategoriId" = k.id
        ${startDate && endDate ? Prisma.sql`WHERE m."createdAt" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}` : Prisma.empty}
        ORDER BY m."createdAt" DESC
      `;

      data = maintenanceData.map((item) => ({
        "Tanggal": formatDate(item.createdAt),
        "Nama Barang": item.barangNama,
        "Serial Number": item.serialNumber,
        "Kategori": item.namaKategori || "-",
        "Pemohon": item.userName,
        "Alasan": item.alasanPerbaikan,
        "Status": item.status,
        "Keterangan": item.keterangan || "-",
      }));

      filename = "maintenance-report";
    } else if (type === "stock") {
      const stockData = await prisma.$queryRaw<StockRow[]>`
        SELECT 
          s.id,
          s."serialNumber",
          s.status,
          s.jumlah,
          b.nama as "barangNama",
          k."namaKategori"
        FROM "SeriBarang" s
        JOIN "Barang" b ON s."barangId" = b.id
        LEFT JOIN "Kategori" k ON b."kategoriId" = k.id
        ORDER BY b.nama ASC
      `;

      data = stockData.map((item) => ({
        "Nama Barang": item.barangNama,
        "Serial Number": item.serialNumber,
        "Kategori": item.namaKategori || "-",
        "Stok": item.jumlah,
        "Status": item.status,
      }));

      filename = "stock-report";
    } else if (type === "activity") {
      const activityData = await prisma.$queryRaw<ActivityRow[]>`
        SELECT 
          l.id,
          l."createdAt",
          l.aksi,
          l.detail,
          u.name as "userName"
        FROM "LogAktivitas" l
        JOIN "User" u ON l."userId" = u.id
        ${startDate && endDate ? Prisma.sql`WHERE l."createdAt" BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}` : Prisma.empty}
        ORDER BY l."createdAt" DESC
      `;

      data = activityData.map((item) => ({
        "Tanggal": formatDate(item.createdAt),
        "User": item.userName,
        "Aksi": item.aksi,
        "Detail": item.detail,
      }));

      filename = "activity-report";
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    const headers = new Headers();
    headers.append("Content-Disposition", `attachment; filename="${filename}-${formatDate(new Date())}.xlsx"`);
    headers.append("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    return new Response(buf, { headers });
  } catch (error) {
    console.error("[EXPORT_GET]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengekspor data" },
      { status: 500 }
    );
  }
} 