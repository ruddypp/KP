import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Prisma } from "@prisma/client"

type MaintenanceRow = {
  id: string;
  createdAt: Date;
  alasanPerbaikan: string;
  status: string;
  keterangan: string | null;
  userName: string;
  userEmail: string;
  barangNama: string;
  serialNumber: string;
  namaKategori: string | null;
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const maintenance = await prisma.$queryRaw<MaintenanceRow[]>`
      SELECT 
        m.id,
        m."createdAt",
        m."alasanPerbaikan",
        m.status,
        m.keterangan,
        u.name as "userName",
        u.email as "userEmail",
        b.nama as "barangNama",
        s."serialNumber",
        k."namaKategori"
      FROM "RequestMaintenance" m
      JOIN "User" u ON m."userId" = u.id
      JOIN "SeriBarang" s ON m."seriBarangId" = s.id
      JOIN "Barang" b ON s."barangId" = b.id
      LEFT JOIN "Kategori" k ON b."kategoriId" = k.id
      ${session.user.role === "USER" ? Prisma.sql`WHERE m."userId" = ${session.user.id}` : Prisma.empty}
      ${status ? Prisma.sql`${session.user.role === "USER" ? "AND" : "WHERE"} m.status = ${status}` : Prisma.empty}
      ORDER BY m."createdAt" DESC
    `

    return NextResponse.json(maintenance)
  } catch (error) {
    console.error("[MAINTENANCE_GET]", error)
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data" },
      { status: 500 }
    )
  }
} 