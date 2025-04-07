import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { pusherServer } from "@/lib/pusher";

// GET: Ambil semua request penggunaan
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
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    const requests = await prisma.requestPenggunaan.findMany({
      where: {
        ...(status && { status: status as "PENDING" | "APPROVED" | "REJECTED" }),
        ...(userId && { userId }),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        seriBarang: {
          include: {
            barang: {
              include: {
                kategori: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("[REQUEST_GET]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengambil data" },
      { status: 500 }
    );
  }
}

// POST: Buat request penggunaan baru
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
    const { seriBarangId, jumlah, alasan } = body;

    // Validasi input
    if (!seriBarangId || !jumlah) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Cek ketersediaan barang
    const seriBarang = await prisma.seriBarang.findUnique({
      where: { id: seriBarangId },
      include: {
        barang: true,
      },
    });

    if (!seriBarang || seriBarang.status !== "AVAILABLE") {
      return NextResponse.json(
        { message: "Barang tidak tersedia" },
        { status: 400 }
      );
    }

    if (seriBarang.jumlah < jumlah) {
      return NextResponse.json(
        { message: "Stok tidak mencukupi" },
        { status: 400 }
      );
    }

    // Buat request penggunaan
    const request = await prisma.requestPenggunaan.create({
      data: {
        userId: session.user.id,
        seriId: seriBarangId,
        jumlah,
        keterangan: alasan,
        status: "PENDING",
      },
      include: {
        user: true,
        seriBarang: {
          include: {
            barang: true
          }
        },
      },
    });

    // Log aktivitas
    await prisma.logAktivitas.create({
      data: {
        userId: session.user.id,
        aksi: "REQUEST",
        detail: `Mengajukan permintaan penggunaan: ${request.seriBarang.barang.nama} (${request.seriBarang.serialNumber})`,
        barangId: request.seriBarang.barang.id,
        seriId: request.seriBarang.id,
      },
    });

    // Trigger Pusher event
    await pusherServer.trigger("inventory", "request:create", {
      message: `Permintaan penggunaan baru dari ${request.user.name}`,
      request,
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("[REQUEST_POST]", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { message: "Terjadi kesalahan pada database" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan saat membuat permintaan" },
      { status: 500 }
    );
  }
}

// PATCH: Update status request
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { id, status, keterangan } = body;

    if (!id || !status) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    const request = await prisma.requestPenggunaan.update({
      where: { id },
      data: {
        status,
        keterangan,
      },
      include: {
        user: true,
        seriBarang: {
          include: {
            barang: true
          }
        },
      },
    });

    // Update stok dan status jika disetujui
    if (status === "APPROVED") {
      await prisma.seriBarang.update({
        where: { id: request.seriBarang.id },
        data: {
          jumlah: {
            decrement: request.jumlah,
          },
          status: request.jumlah === request.seriBarang.jumlah ? "USED" : "AVAILABLE",
        },
      });

      // Log aktivitas
      await prisma.logAktivitas.create({
        data: {
          userId: session.user.id,
          aksi: "APPROVE",
          detail: `Menyetujui permintaan penggunaan: ${request.seriBarang.barang.nama} (${request.seriBarang.serialNumber})`,
          barangId: request.seriBarang.barang.id,
          seriId: request.seriBarang.id,
        },
      });
    }

    // Trigger Pusher event
    await pusherServer.trigger("inventory", "request:update", {
      message: `Request penggunaan ${status === "APPROVED" ? "disetujui" : "ditolak"}`,
      request,
    });

    return NextResponse.json(request);
  } catch (error) {
    console.error("[REQUEST_PATCH]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat memperbarui permintaan" },
      { status: 500 }
    );
  }
} 