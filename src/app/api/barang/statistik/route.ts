import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const statistik = await prisma.requestPenggunaan.groupBy({
      by: ["tanggalPenggunaan"],
      _count: {
        id: true,
      },
      where: {
        tanggalPenggunaan: {
          gte: thirtyDaysAgo,
        },
        status: "APPROVED",
      },
      orderBy: {
        tanggalPenggunaan: "asc",
      },
    })

    const data = statistik.map((item) => ({
      tanggal: item.tanggalPenggunaan,
      jumlah: item._count.id,
    }))

    return NextResponse.json(data)
  } catch {
    console.error("Error fetching barang statistics:")
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data" },
      { status: 500 }
    )
  }
} 