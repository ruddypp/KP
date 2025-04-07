import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth/next';
import { z } from 'zod';
import { pusherServer } from '@/lib/pusher';

// Skema validasi untuk update kategori
const updateKategoriSchema = z.object({
  namaKategori: z.string().min(1, { message: "Nama kategori tidak boleh kosong." })
});

// Handler untuk PUT (update kategori)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const id = params.id;
  try {
    const body = await req.json();
    const validation = updateKategoriSchema.safeParse(body);

    if (!validation.success) {
      return new NextResponse(JSON.stringify({ message: 'Data tidak valid', errors: validation.error.errors }), { status: 400 });
    }

    const namaKategoriBaru = validation.data.namaKategori;

    // Ambil nama lama untuk log (opsional tapi bagus)
    const kategoriLama = await prisma.kategori.findUnique({ where: { id }, select: { namaKategori: true } });

    const updatedKategori = await prisma.kategori.update({
      where: { id },
      data: { namaKategori: namaKategoriBaru, },
    });

    // --- Log Aktivitas --- 
    try {
        await prisma.logAktivitas.create({
            data: {
                userId: session.user.id,
                aksi: 'UPDATE_KATEGORI',
                detail: `Mengupdate kategori ID: ${id} (Nama: ${kategoriLama?.namaKategori ?? 'N/A'} -> ${namaKategoriBaru})`,
            }
        });
    } catch (logError) {
        console.error("Gagal mencatat log aktivitas (Update Kategori):", logError);
    }
    // -------------------- 

     // --- Trigger Pusher --- 
     try {
        await pusherServer.trigger('admin-channel', 'kategori:updated', { 
            message: `Kategori "${namaKategoriBaru}" diupdate.`,
            kategoriId: updatedKategori.id
        });
     } catch (pusherError) {
        console.error("Gagal trigger Pusher (Update Kategori):", pusherError);
     }
    // --------------------- 

    return NextResponse.json(updatedKategori);
  } catch (error: any) {
    // Handle potensi error jika nama kategori unik
    if (error.code === 'P2002' && error.meta?.target?.includes('namaKategori')) {
      return new NextResponse(JSON.stringify({ message: 'Nama kategori sudah ada.' }), { status: 409 });
    }
    if (error.code === 'P2025') { // Handle jika ID tidak ditemukan
        return new NextResponse(JSON.stringify({ message: 'Kategori tidak ditemukan.' }), { status: 404 });
    }
    console.error(`Error updating kategori with ID ${id}:`, error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
}

// Handler untuk DELETE (hapus kategori)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'ADMIN') {
    return new NextResponse(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }

  const id = params.id;
  try {
    const kategoriToDelete = await prisma.kategori.findUnique({ where: { id }, select: { namaKategori: true } });
    if (!kategoriToDelete) {
        return new NextResponse(JSON.stringify({ message: 'Kategori tidak ditemukan.' }), { status: 404 });
    }
    const namaKategori = kategoriToDelete.namaKategori;

    const barangCount = await prisma.barang.count({ where: { kategoriId: id } });
    if (barangCount > 0) {
        return new NextResponse(JSON.stringify({ message: 'Tidak dapat menghapus kategori karena masih ada barang terkait.' }), { status: 400 });
    }

    await prisma.kategori.delete({ where: { id }, });

     // --- Log Aktivitas --- 
    try {
        await prisma.logAktivitas.create({
            data: {
                userId: session.user.id,
                aksi: 'DELETE_KATEGORI',
                detail: `Menghapus kategori: ${namaKategori} (ID: ${id})`,
            }
        });
    } catch (logError) {
        console.error("Gagal mencatat log aktivitas (Delete Kategori):", logError);
    }
    // -------------------- 

     // --- Trigger Pusher --- 
     try {
        await pusherServer.trigger('admin-channel', 'kategori:deleted', { 
            message: `Kategori "${namaKategori}" dihapus.`,
            kategoriId: id
        });
     } catch (pusherError) {
        console.error("Gagal trigger Pusher (Delete Kategori):", pusherError);
     }
    // --------------------- 

    return new NextResponse(null, { status: 204 }); // 204 No Content
  } catch (error: any) {
      if (error.code === 'P2025') { // Handle jika ID tidak ditemukan
        return new NextResponse(JSON.stringify({ message: 'Kategori tidak ditemukan.' }), { status: 404 });
      }
    console.error(`Error deleting kategori with ID ${id}:`, error);
    return new NextResponse(JSON.stringify({ message: 'Internal Server Error' }), { status: 500 });
  }
} 