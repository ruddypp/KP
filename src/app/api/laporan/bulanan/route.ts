import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const bulan = searchParams.get("bulan"); // Format: YYYY-MM
    const kategoriId = searchParams.get("kategoriId");

    if (!bulan) {
      return NextResponse.json(
        { message: "Parameter bulan diperlukan" },
        { status: 400 }
      );
    }

    const [year, month] = bulan.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Mengambil data laporan bulanan yang sudah ada
    const existingReport = await prisma.laporanBulanan.findFirst({
      where: {
        bulan: startDate,
        kategoriId: kategoriId || null
      }
    });

    if (existingReport) {
      return NextResponse.json(existingReport);
    }

    // Jika belum ada, generate laporan baru
    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      ...(kategoriId && {
        barang: {
          kategoriId: kategoriId
        }
      })
    };

    // Hitung total barang berdasarkan kategori
    const totalBarang = await prisma.barang.count({
      where: whereClause,
    });

    // Hitung total peminjaman (request penggunaan approved) berdasarkan kategori & bulan
    const totalPeminjaman = await prisma.requestPenggunaan.count({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(kategoriId && {
          seriBarang: {
            barang: {
              kategoriId: kategoriId,
            },
          },
        }),
      },
    });

    // Hitung total maintenance berdasarkan kategori & bulan
    const totalMaintenance = await prisma.requestMaintenance.count({
      where: {
        // Asumsi status maintenance adalah APPROVED atau ada field status lain?
        // status: "APPROVED", 
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        ...(kategoriId && {
          seriBarang: {
            barang: {
              kategoriId: kategoriId,
            },
          },
        }),
      },
    });

    // Simpan laporan
    const laporan = await prisma.laporanBulanan.create({
      data: {
        bulan: startDate,
        kategoriId: kategoriId || null,
        totalBarang,
        totalPeminjaman,
        totalMaintenance
      }
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error("[LAPORAN_BULANAN_GET]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data laporan" },
      { status: 500 }
    );
  }
}

// POST untuk generate ulang laporan
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { bulan, kategoriId } = body;

    if (!bulan) {
      return NextResponse.json(
        { message: "Parameter bulan diperlukan" },
        { status: 400 }
      );
    }

    const [year, month] = bulan.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Hapus laporan yang sudah ada
    await prisma.laporanBulanan.deleteMany({
      where: {
        bulan: startDate,
        kategoriId: kategoriId || null
      }
    });

    // Generate laporan baru dengan data terkini
    const whereClause = {
      createdAt: {
        gte: startDate,
        lte: endDate
      },
      ...(kategoriId && {
        barang: {
          kategoriId: kategoriId
        }
      })
    };

    const [totalBarang, totalPeminjaman, totalMaintenance] = await Promise.all([
      prisma.seriBarang.count({ where: whereClause }),
      prisma.requestPenggunaan.count({
        where: {
          ...whereClause,
          status: "APPROVED"
        }
      }),
      prisma.requestMaintenance.count({
        where: {
          ...whereClause,
          status: "APPROVED"
        }
      })
    ]);

    const laporan = await prisma.laporanBulanan.create({
      data: {
        bulan: startDate,
        kategoriId: kategoriId || null,
        totalBarang,
        totalPeminjaman,
        totalMaintenance
      }
    });

    return NextResponse.json(laporan);
  } catch (error) {
    console.error("[LAPORAN_POST]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat laporan" },
      { status: 500 }
    );
  }
} 