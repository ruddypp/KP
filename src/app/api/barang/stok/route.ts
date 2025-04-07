import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Status } from "@prisma/client";

// GET untuk mendapatkan info stok
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
    const barangId = searchParams.get("barangId");
    const seriId = searchParams.get("seriId");
    const lowStock = searchParams.get("lowStock") === "true";

    // Jika lowStock=true, ambil semua barang dengan stok rendah
    if (lowStock) {
      const lowStockItems = await prisma.seriBarang.findMany({
        where: {
          status: Status.AVAILABLE,
          jumlah: {
            lte: prisma.seriBarang.fields.threshold,
          },
        },
        include: {
          barang: {
            include: {
              kategori: true,
            },
          },
        },
        orderBy: {
          jumlah: "asc",
        },
      });

      return NextResponse.json(lowStockItems);
    }

    // Jika tidak ada parameter atau ada parameter spesifik
    if (!barangId && !seriId) {
      return NextResponse.json(
        { message: "Parameter tidak valid" },
        { status: 400 }
      );
    }

    const stok = await prisma.seriBarang.findMany({
      where: {
        OR: [
          { barangId: barangId || undefined },
          { id: seriId || undefined },
        ],
      },
      include: {
        barang: {
          include: {
            kategori: true,
          },
        },
      },
      orderBy: {
        jumlah: "asc",
      },
    });

    return NextResponse.json(stok);
  } catch (error) {
    console.error("[STOK_GET]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data" },
      { status: 500 }
    );
  }
}

// POST untuk update stok
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { seriId, stokMasuk, stokKeluar } = body;

    if (!seriId || (stokMasuk === undefined && stokKeluar === undefined)) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Kembalikan respons yang sesuai (mungkin perlu mengambil data seri terbaru)
    const seriTerbaru = await prisma.seriBarang.findUnique({
      where: { id: seriId },
      include: { barang: true }, // Include barang jika diperlukan untuk respons
    });

    return NextResponse.json(seriTerbaru); // Kembalikan data seri terbaru
  } catch (error) {
    console.error("[STOK_POST]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengupdate stok" },
      { status: 500 }
    );
  }
} 