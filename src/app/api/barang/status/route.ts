import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const statusCount = await prisma.seriBarang.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    })

    return NextResponse.json(statusCount)
  } catch {
    console.error("[STATUS_BARANG_PATCH]")
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data" },
      { status: 500 }
    )
  }
} 