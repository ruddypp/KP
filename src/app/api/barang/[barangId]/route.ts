import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

// GET /api/barang/[barangId] - (Mungkin tidak perlu jika detail di tabel)
// export async function GET(...) { ... }

// PUT /api/barang/[barangId]
export async function PUT(
  req: Request,
  { params }: { params: { barangId: string } }
) {
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

    const { nama, kategoriId } = await req.json();

    if (!nama || !kategoriId) {
      return NextResponse.json(
        { message: "Nama dan kategori harus diisi" },
        { status: 400 }
      );
    }

    const existingBarang = await prisma.barang.findFirst({
      where: {
        nama,
        kategoriId,
        NOT: {
          id: params.barangId,
        },
      },
    });

    if (existingBarang) {
      return NextResponse.json(
        { message: "Barang sudah ada di kategori ini" },
        { status: 400 }
      );
    }

    // Ambil data lama untuk log
    const barangLama = await prisma.barang.findUnique({ where: { id: params.barangId }, select: { nama: true, kategoriId: true } }); 

    console.log(`--- Attempting to update barang ID: ${params.barangId} in database...`); // <-- LOG SEBELUM UPDATE
    const barang = await prisma.barang.update({
      where: {
        id: params.barangId,
      },
      data: {
        nama,
        kategoriId,
      },
      include: {
        kategori: true,
      },
    });
    console.log(`--- Successfully updated barang ID: ${params.barangId}. Result:`, barang); // <-- LOG SETELAH UPDATE BERHASIL

    // Log aktivitas
    await prisma.logAktivitas.create({
      data: {
        userId: session.user.id,
        aksi: "UPDATE",
        detail: `Mengubah barang: ${nama} (${barang.kategori.namaKategori})`,
        barangId: barang.id,
      },
    });

    return NextResponse.json(barang);
  } catch (error) {
    console.error("[BARANG_PUT]", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat mengubah barang" },
      { status: 500 }
    );
  }
}

// DELETE /api/barang/[barangId]
export async function DELETE(
  req: Request,
  { params }: { params: { barangId: string } }
) {
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

    const barang = await prisma.barang.findUnique({
      where: {
        id: params.barangId,
      },
      include: {
        kategori: true,
        seri: true,
      },
    });

    if (!barang) {
      return NextResponse.json(
        { message: "Barang tidak ditemukan" },
        { status: 404 }
      );
    }

    if (barang.seri.length > 0) {
      return NextResponse.json(
        { message: "Tidak dapat menghapus barang yang memiliki seri" },
        { status: 400 }
      );
    }

    // <<< PINDAHKAN LOG AKTIVITAS KE SINI (SEBELUM DELETE) >>>
    try {
        await prisma.logAktivitas.create({
          data: {
            userId: session.user.id,
            aksi: "DELETE",
            detail: `Menghapus barang: ${barang.nama} (${barang.kategori.namaKategori})`,
            barangId: barang.id,
          },
        });
    } catch (logError) {
        // Log error jika gagal membuat log, tapi mungkin tetap lanjutkan delete?
        // Atau bisa juga return error di sini jika log wajib berhasil.
        console.error("[BARANG_DELETE] Gagal Log Aktivitas:", logError); 
        // Pertimbangkan: return NextResponse.json({ message: "Gagal mencatat log aktivitas" }, { status: 500 });
    }
    // <<< AKHIR BLOK LOG AKTIVITAS >>>

    // Baru hapus barang setelah log (jika berhasil atau jika error log diabaikan)
    await prisma.barang.delete({
      where: {
        id: params.barangId,
      },
    });

    // Respon sukses (sebelumnya mengembalikan objek barang, 
    // tapi karena sudah dihapus, lebih baik kembalikan 204 No Content atau konfirmasi sukses)
    // return NextResponse.json(barang); // <-- Tidak bisa karena barang sudah dihapus
    return new NextResponse(null, { status: 204 }); // <-- Standar untuk DELETE sukses

  } catch (error: unknown) {
    console.error("[BARANG_DELETE]", error);
    // Tangani jika error berasal dari findUnique atau delete itu sendiri
    if (error instanceof PrismaClientKnownRequestError) { 
        if (error.code === 'P2025') {
           return NextResponse.json({ message: "Gagal menghapus: Barang tidak ditemukan." }, { status: 404 });
        }
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan saat menghapus barang" },
      { status: 500 }
    );
  }
} 