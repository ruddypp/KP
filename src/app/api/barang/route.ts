import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { pusherServer } from '@/lib/pusher';

// Skema validasi untuk data barang baru
const barangSchema = z.object({
  nama: z.string().min(1, { message: "Nama barang tidak boleh kosong." }),
  kategoriId: z.string().min(1, { message: "Kategori harus dipilih." })
});

// GET /api/barang - Mengambil daftar barang
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const barang = await prisma.barang.findMany({
      include: {
        kategori: {
          select: { id: true, namaKategori: true }
        },
        _count: {
          select: { seri: true } // Hitung jumlah seri terkait
        }
      },
      orderBy: {
        nama: 'asc',
      },
    });
    return NextResponse.json(barang);
  } catch (error) {
    console.error("Error fetching barang:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

// POST /api/barang - Membuat barang baru
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  try {
    const body = await req.json();
    const validation = barangSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ message: 'Data tidak valid', errors: validation.error.errors }), { status: 400 });
    }

    const { nama, kategoriId } = validation.data;

    // Pastikan kategoriId valid
    const kategoriExists = await prisma.kategori.findUnique({ where: { id: kategoriId } });
    if (!kategoriExists) {
      return new NextResponse(JSON.stringify({ message: 'Kategori tidak ditemukan.' }), { status: 404 });
    }

    const newBarang = await prisma.barang.create({
      data: {
        nama: nama,
        kategoriId: kategoriId,
      },
    });

    // Log Aktivitas
    try {
      await prisma.logAktivitas.create({
        data: {
          userId: session.user.id,
          aksi: 'CREATE_BARANG',
          detail: `Membuat barang baru: ${nama} (ID: ${newBarang.id})`,
          barangId: newBarang.id // Kaitkan dengan barang
        }
      });
    } catch (logError) {
      console.error("Gagal log CREATE_BARANG:", logError);
    }
    
    // Trigger Pusher (opsional untuk barang baru)
    // try {
    //   await pusherServer.trigger('admin-channel', 'barang:created', { ... });
    // } catch (pusherError) { ... }

    return NextResponse.json(newBarang, { status: 201 });
  } catch (error: any) {
    console.error("Error creating barang:", error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
} 